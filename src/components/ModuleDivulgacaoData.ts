// SaaS Divulgation Messages with 41 Modules
// Contains copyable templates for Email, WhatsApp, and Web Push notifications

export interface SaaSModuleDivulgation {
  id: string;
  nome: string;
  iconName: string;
  categoria: 'Gestão & Secretaria' | 'Financeiro & Contábil' | 'Liderança & Comunicação' | 'Ensino & Família' | 'Segurança & Infraestrutura';
  descricaoCurta: string;
  principaisDestaques: string[];
}

export const SAAS_MODULES_LIST: SaaSModuleDivulgation[] = [
  {
    id: 'gipp_docs',
    nome: 'GIPP DOCs (Processador de Documentos)',
    iconName: 'FileText',
    categoria: 'Gestão & Secretaria',
    descricaoCurta: 'Processador de texto rico completo estilo Google Docs / Word com suporte a modelos eclesiásticos predefinidos, exportação .docx e salvamento .gdoc.',
    principaisDestaques: [
      'Editor visual rico com barra de ferramentas avançada e suporte a formatação .docx',
      'Biblioteca com modelos oficiais: Cartas de Recomendação, Ofícios Pastorais, Atas e Regimentos',
      'Leitura e carregamento direto de arquivos do computador com salvamento de atalhos locais',
      'Integração total com o timbre e dados da congregação mestre'
    ]
  },
  {
    id: 'gipp_planilhas',
    nome: 'GIPP Planilhas (Planilhas Eletrônicas)',
    iconName: 'Table',
    categoria: 'Financeiro & Contábil',
    descricaoCurta: 'Editor de planilhas eletrônicas de alta performance estilo Google Sheets / Excel, com suporte a fórmulas, múltiplas abas e modelos prontos.',
    principaisDestaques: [
      'Grade interativa de células com barra de fórmulas e suporte a funções financeiras e matemáticas',
      'Modelos prontos de planilhas: Chamada EBD, Inventário de Patrimônio, Fluxo de Caixa e Escalas',
      'Exportação nativa para .xlsx e salvamento de arquivos locais no formato .gplan',
      'Cálculos automatizados e formatação de moedas e percentuais'
    ]
  },
  {
    id: 'secretaria',
    nome: 'Secretaria Integrada',
    iconName: 'Users',
    categoria: 'Gestão & Secretaria',
    descricaoCurta: 'Controle de membros, fichas, batismos, casamentos, históricos e admissões com prontuário digital.',
    principaisDestaques: [
      'Ficha cadastral completa com foto e campos personalizados',
      'Histórico de batismos, consagrações e transferências em um clique',
      'Gerenciamento de congregações, filiais e departamentos espirituais',
      'Emissão instantânea de atas de reuniões e relatórios executivos de crescimento'
    ]
  },
  {
    id: 'contabilidade',
    nome: 'Contabilidade e DP',
    iconName: 'Layers',
    categoria: 'Financeiro & Contábil',
    descricaoCurta: 'Balancetes, departamento pessoal, obrigações patronais, fechamento contábil e balanço patrimonial.',
    principaisDestaques: [
      'Geração de folha de pagamento e recibos de prebenda pastoral',
      'Cálculo de encargos sociais e controle de retenções tributárias',
      'Relatório de balancete oficial em conformidade com o fisco e GIPP',
      'Exportação para contador ou arquivamento de guias e certidões'
    ]
  },
  {
    id: 'financeiro',
    nome: 'Gestão Financeira (Livro Caixa)',
    iconName: 'DollarSign',
    categoria: 'Financeiro & Contábil',
    descricaoCurta: 'Controle rigoroso de entradas de dízimos/ofertas, despesas recorrentes, caixa geral e gráfico gerencial.',
    principaisDestaques: [
      'Fluxo de Caixa diário consolidado por filial ou integrado',
      'Lançamento de saídas parametrizadas com digitalização do cupom fiscal',
      'Gráficos interativos de receitas vs despesas para prestação de contas',
      'Geração automática do Livro Caixa oficial em PDF para aprovação'
    ]
  },
  {
    id: 'portal_pastor',
    nome: 'Portal do Pastor',
    iconName: 'UserCheck',
    categoria: 'Liderança & Comunicação',
    descricaoCurta: 'Painel executivo móvel para líderes monitorarem dízimos, visitas, aniversariantes e agendas de cultos.',
    principaisDestaques: [
      'Indicadores financeiros e de presença consolidados no celular',
      'Acompanhamento de visitas pastorais e pedidos de intercessão urgentes',
      'Notificações de aniversariantes do dia para envio de felicitações diretas',
      'Criação e acompanhamento de metas espirituais para a congregação'
    ]
  },
  {
    id: 'portal_tesoureiro',
    nome: 'Portal do Tesoureiro',
    iconName: 'Wallet',
    categoria: 'Financeiro & Contábil',
    descricaoCurta: 'Interface simplificada para digitação ágil de entradas, ofertas e emissão rápida de comprovantes.',
    principaisDestaques: [
      'Lançamento de dízimos por membro em lote super simplificado',
      'Impressão térmica rápida de recibo de dízimo e comprovante impresso',
      'Painel de lançamentos do dia com validação dupla de senha',
      'Abertura e fechamento de caixa digital monitorado por filial'
    ]
  },
  {
    id: 'ministerios',
    nome: 'Ministérios & Departamentos',
    iconName: 'Shield',
    categoria: 'Gestão & Secretaria',
    descricaoCurta: 'Organização de escalas de serviços de louvor, mídia, recepção, obreiros e lideranças espirituais.',
    principaisDestaques: [
      'Criação de ministérios ilimitados com líderes dedicados',
      'Escalas de dízimo e culto automatizadas sem conflito de datas',
      'Envio automático da escala da semana para o WhatsApp do membro',
      'Histórico de presença e checklist para equipe técnica de apoio'
    ]
  },
  {
    id: 'ebd',
    nome: 'Escola Bíblica Dominical (EBD)',
    iconName: 'GraduationCap',
    categoria: 'Ensino & Família',
    descricaoCurta: 'Gestão pedagógica completa de salas de aula, presença digital, matrículas, notas, lições e pontuações.',
    principaisDestaques: [
      'Chamada eletrônica simples realizada pelo celular do professor',
      'Controle de pontuação por revista, bíblia trazida, horário e dízimos',
      'Ambiente para controle de turmas (berçário, jovens, casais, líderes)',
      'Relatórios automáticos de frequência média e desempenho dinâmico'
    ]
  },
  {
    id: 'kids',
    nome: 'Salinha Kids (Ministério Infantil)',
    iconName: 'Baby',
    categoria: 'Ensino & Família',
    descricaoCurta: 'Check-in e check-out seguro de crianças por QR Code, etiquetas, controle de alergias e segurança infantil.',
    principaisDestaques: [
      'Impressão de etiqueta de segurança para a criança e outra para o tutor',
      'Validação facial ou via QR Code digital no momento da retirada',
      'Cadastro de alergias alimentares, restrições médicas e telefones úteis',
      'Notificação push instantânea para celular do pai caso necessite suporte'
    ]
  },
  {
    id: 'celulas',
    nome: 'Células & Pequenos Grupos',
    iconName: 'Target',
    categoria: 'Ensino & Família',
    descricaoCurta: 'Relatórios de reuniões familiares, consolidação de anfitriões, supervisão de redes e metas de multiplicação.',
    principaisDestaques: [
      'Preenchimento de relatório de células pelo celular do líder',
      'Mapa de calor com geolocalização de todas as células da cidade',
      'Monitoramento de dízimos da célula, visitantes frequentes e decisões',
      'Função de envio de links de reuniões via WhatsApp para o grupo'
    ]
  },
  {
    id: 'carteirinha',
    nome: 'Carteirinhas Digitais',
    iconName: 'IdCard',
    categoria: 'Gestão & Secretaria',
    descricaoCurta: 'Central de emissão de credenciais físicas e virtuais com foto, dízimos, QR Code de validação e layout.',
    principaisDestaques: [
      'Emissão em PDF padrão A4 ou vetor pronto para impressora de cartões PVC',
      'Autenticação antifraude com QR Code único validado por link público',
      'Atualização automática de cargos, consagrações e vencimentos',
      'Visualização da carteirinha digital integrada na área privada do membro'
    ]
  },
  {
    id: 'boletim',
    nome: 'Boletim Digital',
    iconName: 'Newspaper',
    categoria: 'Liderança & Comunicação',
    descricaoCurta: 'Edição e envio rápido de boletins e notícias semanais, sermões transcritos e quadros de escalas de cultos.',
    principaisDestaques: [
      'Templates prontos, limpos e estéticos para o Boletim da Igreja',
      'Link público dinâmico gerado para compartilhamento nos grupos',
      'Integração de mural de orações semanais e versículos inspiradores',
      'Contracepção de gastos com papel físico de panfletos informativos'
    ]
  },
  {
    id: 'midiatab',
    nome: 'Mídias & Redes Sociais',
    iconName: 'Video',
    categoria: 'Liderança & Comunicação',
    descricaoCurta: 'Criação de transmissões, inserção de canais de vídeo, boletim multimídia e conexões sociais da congregação.',
    principaisDestaques: [
      'Projeção de avisos dinâmicos para telões de LED da igreja',
      'Upload e distribuição interna de apostilas, mídias históricas e fotos',
      'Central de links de transmissão do YouTube, Spotify e lives do Instagram',
      'Disparo de artes semanais e criativos de dízimos para mídia local'
    ]
  },
  {
    id: 'frotas',
    nome: 'Controle de Frotas',
    iconName: 'Truck',
    categoria: 'Segurança & Infraestrutura',
    descricaoCurta: 'Gestão do veículo oficial da igreja, motoristas autorizados, manutenções, dízimo de combustível e reservas.',
    principaisDestaques: [
      'Agenda digital para reserva de ônibus, vans ou carros da congregação',
      'Controle absoluto de quilometragem e combustível consumido',
      'Checklist de inspeção visual obrigatório antes do veículo rodar',
      'Avisos preventivos automáticos de troca de óleo, pneus e impostos'
    ]
  },
  {
    id: 'visitantes',
    nome: 'Visitantes & Acolhimento',
    iconName: 'UserPlus',
    categoria: 'Gestão & Secretaria',
    descricaoCurta: 'Fichas de novos convertidos, acompanhamento consolidado pós-culto, trilha de discipulado e padrinhos.',
    principaisDestaques: [
      'Captação prática de contatos via link simplificado ou QR Code',
      'Distribuição automática de visitantes para equipes de ligadores locais',
      'Régua de contatos pelo WhatsApp com mensagens de boas-vindas automáticas',
      'Estatísticas de conversão e progresso de consolidação na fé'
    ]
  },
  {
    id: 'patrimonio',
    nome: 'Patrimônio & Inventário',
    iconName: 'Building2',
    categoria: 'Financeiro & Contábil',
    descricaoCurta: 'Tombo de bens móveis e imóveis, controle físico com etiquetas eletrônicas, notas de compra e termo de cautela.',
    principaisDestaques: [
      'Geração de etiquetas de código de barras prontas para inventário físico',
      'Registro financeiro de depreciação contábil mensal de aparelhos',
      'Vínculo de termo de cautela virtual e responsabilidade de voluntários',
      'Gestão de doadores e termo de recebimento de doação física'
    ]
  },
  {
    id: 'missoes',
    nome: 'Missões e Ação Social',
    iconName: 'Globe',
    categoria: 'Liderança & Comunicação',
    descricaoCurta: 'Suporte a missionários parceiros, envio de cartões de notícias de campo, controle de dízimos missionários.',
    principaisDestaques: [
      'Mural digital de cartas e orações de missionários ativos',
      'Destinação exclusiva de recursos arrecadados para o caixa missionário',
      'Gerenciamento de campanhas sazonais de agasalhos, dízimos e alimentos',
      'Estatísticas de famílias apoiadas nos projetos sociais locais'
    ]
  },
  {
    id: 'assistente_ai',
    nome: 'Assistente IA GIPP',
    iconName: 'Sparkles',
    categoria: 'Liderança & Comunicação',
    descricaoCurta: 'Plataforma integrada de inteligência artificial para confecção de esboços de pregações, atas e mensagens.',
    principaisDestaques: [
      'Gerador inteligente de esboços de sermões com base em referências bíblicas',
      'Idealizador de ideias para criativos do Instagram e posts institucionais',
      'Redator assistencial de cartas para transferência e comunicados dízimos',
      'Criação automática de roteiros de cultos organizados por minutos'
    ]
  },
  {
    id: 'gestao_cursos',
    nome: 'Gestão de Cursos',
    iconName: 'Book',
    categoria: 'Ensino & Família',
    descricaoCurta: 'Matrículas, cronogramas de aulas, diário de presença, professores vinculados e notas para institutos bíblicos.',
    principaisDestaques: [
      'Gerenciamento de cursos como Escola de Líderes, Teologia Básica, etc.',
      'Acompanhamento de aproveitamento acadêmico para aprovação em cargos',
      'Controle financeiro de mensalidades e venda de apostilas digitais',
      'Emissão de boletim de notas integrado para o celular dos alunos'
    ]
  },
  {
    id: 'certificados',
    nome: 'Estúdio de Certificados',
    iconName: 'Award',
    categoria: 'Gestão & Secretaria',
    descricaoCurta: 'Fábrica de diplomas oficiais para Batismo, Casamento, Apresentação de Crianças e Cursos Teológicos GIPP.',
    principaisDestaques: [
      'Templates clássicos, ornamentados e modernos de nível cartorário',
      'Carimbo e assinatura digital dos pastores pré-configurados',
      'Código alfanumérico antifraude de autenticidade no estatuto',
      'Impressão rápida em alta definição para papel vergê ou opaline'
    ]
  },
  {
    id: 'auditoria',
    nome: 'Auditoria de Logs',
    iconName: 'ClipboardList',
    categoria: 'Segurança & Infraestrutura',
    descricaoCurta: 'Auditagem de acessos, alterações ou exclusões com rastreabilidade absoluta e compliance eclesiástico.',
    principaisDestaques: [
      'Registro detalhado de IP, data, hora, usuário e dados antes de modificar',
      'Rastreabilidade de dízimos excluídos ou lançamentos editados retroativos',
      'Filtros cirúrgicos por operador para resguardar a integridade fiscal',
      'Exportação para relatórios fiscais assinados pelos auditores fiscais'
    ]
  },
  {
    id: 'backup',
    nome: 'Backup & Segurança',
    iconName: 'Database',
    categoria: 'Segurança & Infraestrutura',
    descricaoCurta: 'Cópias de redundância na nuvem prontas para restauração e isolamento em múltiplos servidores.',
    principaisDestaques: [
      'Backup pontual em um clique exportado em JSON estruturado',
      'Configuração de backup noturno automático e cópias espelho',
      'Criptografia de dados sensíveis LGPD de toda a liderança geral',
      'Restauração pontual de módulos selecionados sem comprometer outros'
    ]
  },
  {
    id: 'acessos',
    nome: 'Controle de Acessos',
    iconName: 'Lock',
    categoria: 'Segurança & Infraestrutura',
    descricaoCurta: 'Permissões avançadas por cargo ou congregação para que cada operador use apenas o dízimo correspondente.',
    principaisDestaques: [
      'Criação de perfis de operadores (Tesoureiro Geral, Secretário, Líder EBD)',
      'Restrição por filial: operador só enxerga congregações delegadas',
      'Relatório de permissões vigentes com aprovação de super usuários',
      'Bloqueio automático por horário ou término de função estatutária'
    ]
  },
  {
    id: 'biblia',
    nome: 'Bíblia Digital',
    iconName: 'BookOpen',
    categoria: 'Ensino & Família',
    descricaoCurta: 'Consulta de passagens e versículos bíblicos de 5 versões para leitura, estudos pastorais e projeção direta.',
    principaisDestaques: [
      'Mais de 5 consagradas traduções brasileiras (ARA, ARC, NVI, NVT, AA)',
      'Estúdio de busca rápida de palavras-chave nas escrituras',
      'Dicionário teológico acoplado e comentários para esboços',
      'Modo Projeção sem fios integrado para telão ou retroprojetor'
    ]
  },
  {
    id: 'lixeira',
    nome: 'Lixeira Inteligente',
    iconName: 'Trash',
    categoria: 'Segurança & Infraestrutura',
    descricaoCurta: 'Filtre, recupere e restabeleça dízimos, membros ou atividades deletadas sem danificar integridade do sistema.',
    principaisDestaques: [
      'Retenção temporária de exclusões de membros, ofertas e cursos',
      'Restauração de dados com as conexões e dependências reconfiguradas',
      'Histórico de quem deletou, quando e justificativa obrigatória',
      'Auto-limpeza automática após 30 dias para otimização de espaço'
    ]
  },
  {
    id: 'amparo',
    nome: 'Amparo Legal & Estatutos',
    iconName: 'ScrollText',
    categoria: 'Gestão & Secretaria',
    descricaoCurta: 'Manual de modelos de estatutos, regimentos internos legais corporativos e termos LGPD.',
    principaisDestaques: [
      'Cópia de minutas prontas de estatutos e atas de fundação denominacional',
      'Contratos-modelo para termos de trabalho voluntário com validação eclesiástica',
      'Modelos de consentimento LGPD para captação saudável de dízimos e imagens',
      'Leis atualizadas sobre imunidades fiscais de templos e prebendas pastorais'
    ]
  },
  {
    id: 'manual',
    nome: 'Manual do Usuário',
    iconName: 'Info',
    categoria: 'Ensino & Família',
    descricaoCurta: 'Instruções interativas passo a passo, videoaulas integradas do GIPP e tutoriais rápidos de usabilidade.',
    principaisDestaques: [
      'Vídeos tutoriais integrados para que voluntários aprendam a usar sós',
      'Guia de resolução rápida de problemas sem requerer suporte técnico',
      'Central de perguntas frequentes estruturada por módulos (Dízimos, EBD)',
      'Checklist de boas práticas para implementação do GIPP na congregação'
    ]
  },
  {
    id: 'relatorios',
    nome: 'Relatórios & Business Intelligence',
    iconName: 'FileBarChart',
    categoria: 'Liderança & Comunicação',
    descricaoCurta: 'Indicadores geográficos de membros, gráficos de faixa etária, crescimento financeiro, dízimos e impressões.',
    principaisDestaques: [
      'Mapa interativo mostrando onda de dispersão populacional de membros',
      'Análise em tempo real de retenção e dízimos por frequência local',
      'Pirâmide etária, cruzamentos de dízimos por bairro e estado civil',
      'Motor de impressão de PDF super estéticos prontos para encadernação'
    ]
  },
  {
    id: 'saas_central',
    nome: 'SaaS Multi-Congregações',
    iconName: 'Server',
    categoria: 'Segurança & Infraestrutura',
    descricaoCurta: 'Controle de licenciamento SaaS, monitor de subdomínios, faturas unificadas e controle de dízimos globais.',
    principaisDestaques: [
      'Instalação unificada ou isolada com banco de dados dedicado',
      'Painel de controle de vencimento de plano por congregação filial',
      'Padrões de segurança unificados para criptografia SSL/Bancos',
      'Canais de faturamento integrado para licenças recorrentes dízimos'
    ]
  },
  {
    id: 'licenciamento',
    nome: 'Licenciamento & Chaves',
    iconName: 'Key',
    categoria: 'Segurança & Infraestrutura',
    descricaoCurta: 'Controle de renovação de dízimos anuais do software, chaves de segurança e liberação de recursos.',
    principaisDestaques: [
      'Renovação fácil via PIX automático com ativação na hora',
      'Geração de chaves temporárias para períodos de teste grátis',
      'Faturamento recorrente transparente com histórico completo de recibos',
      'Termos de Uso e Contrato de Licenciamento Digital atualizados'
    ]
  },
  {
    id: 'email_membro',
    nome: 'Mensageria Email Membro',
    iconName: 'Mail',
    categoria: 'Liderança & Comunicação',
    descricaoCurta: 'Campanhas de dízimos, lembretes de aniversários e cartas pastorais enviadas direto para e-mails dos membros.',
    principaisDestaques: [
      'Agendamento automático de e-mails para aniversariantes da data',
      'Filtros de disparos: envie apenas aos membros ativos, liderança ou EBD',
      'Templates visuais elegantes, minimalistas e responsivos',
      'Relatórios simples de taxas de abertura e entrega de e-mails'
    ]
  },
  {
    id: 'email_admin',
    nome: 'Notificações de Gestão',
    iconName: 'Inbox',
    categoria: 'Segurança & Infraestrutura',
    descricaoCurta: 'Disparo de alertas administrativos automáticos: encerramento de caixa, dízimos agendados e avisos fiscais.',
    principaisDestaques: [
      'Resumos semanais contábeis e financeiros para o conselho fiscal',
      'Alerta imediato de tentativas de logins suspeitos de operadores',
      'Avisos de saldos em conta abaixo do estimado para impostos recorrentes',
      'Resumo de membros doentes, dízimos suspensos ou novas solicitações'
    ]
  },
  {
    id: 'frequencia',
    nome: 'Frequência Rápida',
    iconName: 'CheckCheck',
    categoria: 'Gestão & Secretaria',
    descricaoCurta: 'Chamada ágil em cultos e reuniões por código de barras, leitor RFId ou totens em tablets.',
    principaisDestaques: [
      'Controle por tela com leitor de cartão físico ou carteirinha digital',
      'Lançamento supersônico de presença em cultos dominicais com dízimos',
      'Alerta sonoro de cartão validado / dízimo computado com sucesso',
      'Disparo de relatórios automáticos de faltosos no WhatsApp da secretaria'
    ]
  },
  {
    id: 'conciliacao',
    nome: 'Conciliação OFX',
    iconName: 'Landmark',
    categoria: 'Financeiro & Contábil',
    descricaoCurta: 'Conexão bancária via arquivo OFX de qualquer banco, consolidando dízimos e dízimos PIX sem redigitação.',
    principaisDestaques: [
      'Importação de extratos OFX de dízimos bancários ou PIX em segundos',
      'Associação inteligente de dízimos e dízimos por valor e nome',
      'Identificação automática de taxas e tarifas bancárias deduzidas',
      'Reconciliation em 1 clique para manter o caixa real idêntico ao banco'
    ]
  },
  {
    id: 'changelog',
    nome: 'Atualizações & Changelog',
    iconName: 'History',
    categoria: 'Segurança & Infraestrutura',
    descricaoCurta: 'Histórico completo de versões instaladas no SaaS, atualizações de segurança e novos recursos integrados.',
    principaisDestaques: [
      'Mural contendo as novas telas, correções e novidades inseridas',
      'Avisos sobre aperfeiçoamento de recursos fiscais contábeis',
      'Controle de versão ativo para suporte e correções em tempo real',
      'Histórico de pedidos de melhoria atendidos pela equipe GIPP'
    ]
  },
  {
    id: 'suporte',
    nome: 'Dev Suporte Integrado',
    iconName: 'Headset',
    categoria: 'Segurança & Infraestrutura',
    descricaoCurta: 'Ponto de contato direto dos operadores da igreja com o desenvolvedor Master para dúvidas e apoio técnico.',
    principaisDestaques: [
      'Abertura de chamados internos contendo prints e urgência de suporte',
      'Comunicação direta por chat técnico integrado na tela',
      'Histórico de atendimentos resolvidos com avaliação de dízimos',
      'Dicas rápidas de configurações de sistemas na central'
    ]
  },
  {
    id: 'carnes',
    nome: 'Emissor de Carnês',
    iconName: 'FileText',
    categoria: 'Financeiro & Contábil',
    descricaoCurta: 'Geração de boletas, carnês dízimos em PDF de doações para metas de construção ou dízimos anuais recorrentes.',
    principaisDestaques: [
      'Impressão de capas e folhas dadas com código de barras ou PIX QR Code',
      'Vínculo a campanhas financeiras específicas dízimos (Ex: Reforma do Teto)',
      'Controle de pagamentos efetuados e dízimos de inadimplência amigável',
      'Criação de promessas de fé missionárias individuais e conjuntas'
    ]
  },
  {
    id: 'config_visual',
    nome: 'Configuração Visual e Temas',
    iconName: 'Palette',
    categoria: 'Gestão & Secretaria',
    descricaoCurta: 'Ajuste de logotipos, cores primárias, imagens de fundo de dízimos e customização da igreja no SaaS.',
    principaisDestaques: [
      'Substituição rápida da logomarca oficial para cabeçalhos e relatórios',
      'Paletas de cores finas inspiradas no tema eclesiástico atual',
      'Configuração de banners para a tela de login exclusiva da congregação',
      'Alinhamento estético geral que some a marca do desenvolvedor SaaS'
    ]
  },
  {
    id: 'config_gerais',
    nome: 'Configurações de Sistemas',
    iconName: 'Sliders',
    categoria: 'Segurança & Infraestrutura',
    descricaoCurta: 'Configurações fiscais, dízimos, dados denominacionais, CNPJ, cadastro de filiais e links denominacionais.',
    principaisDestaques: [
      'Controle integrado de CNPJ, endereço da Sede e contabilidade unificada',
      'Vínculo de redes sociais denominacionais no cabeçalho geral do site',
      'Configurações tributárias de retenções e relatórios integrados GIPP',
      'Ativação de notificações globais e regras de negócios espirituais'
    ]
  },
  {
    id: 'portal_cadastro_visitante',
    nome: 'Portal de Visitantes',
    iconName: 'UserCheck',
    categoria: 'Liderança & Comunicação',
    descricaoCurta: 'Landing page responsiva para o dízimo do visitante fazer cadastro durante as saudações no culto.',
    principaisDestaques: [
      'QR Code exibido no telão para captação automática de dados',
      'Acesso seguro para celulares com interface limpa e elegante',
      'Integração instantânea com o módulo Visitantes da secretaria',
      'Disparo de dízimos de agradecimento ou convites pastorais automáticos'
    ]
  },
  {
    id: 'gipp_social',
    nome: 'GIPP Social & Feed',
    iconName: 'Instagram',
    categoria: 'Liderança & Comunicação',
    descricaoCurta: 'Rede interna privada para intercessões, dízimos coletivos, avisos e fotos de atividades da comunidade.',
    principaisDestaques: [
      'Canal de dízimos e de orações compartilhado com moderação pastoral',
      'Publicação de recados, fotos de batismos ou avisos de departamentos',
      'Funcionalidade "Gostei" e de comentários de forma segura dízimos',
      'Incentivo e consolidação do convívio comunitário saudável'
    ]
  },
  {
    id: 'agenda',
    nome: 'Agenda Geral de Eventos',
    iconName: 'Calendar',
    categoria: 'Liderança & Comunicação',
    descricaoCurta: 'Calendário unificado da congregação, reuniões do dízimo ministerial, escalas de obreiros e eventos dízimos.',
    principaisDestaques: [
      'Sincronização com o painel de mídias e portal do pastor',
      'Agendamentos recorrentes de cultos ordinários dízimos ou reuniões',
      'Envio de lembrete push no celular de todas as lideranças envolvidas',
      'Estudo de capacidade e ocupação do auditório da igreja'
    ]
  }
];

export const generateSaaSMarketingMessages = (
  modulo: SaaSModuleDivulgation,
  vars: {
    nomeSistema: string;
    urlSistema: string;
    whatsappContato: string;
    emailSaaS: string;
    nomeRevendedor: string;
  }
) => {
  const { nomeSistema, urlSistema, whatsappContato, emailSaaS, nomeRevendedor } = vars;

  // Highlights list formatted with bullets
  const bullets = modulo.principaisDestaques.map(h => `🔹 ${h}`).join('\n');
  const bulletsHtml = modulo.principaisDestaques.map(h => `<li><strong>${h.split(':')[0]}:</strong>${h.split(':')[1] || ''}</li>`).join('');

  // 1. WhatsApp Message
  const whatsapp = `*🚀 DIVULGAÇÃO GIPP: CONHEÇA O MÓDULO ${modulo.nome.toUpperCase()}!*

Quer levar a gestão da sua igreja ao próximo nível e poupar dezenas de horas de trabalho voluntário? Conheça as funcionalidades incríveis do nosso módulo de *${modulo.nome}* no sistema *${nomeSistema}*!

*O que este módulo faz por você:*
_${modulo.descricaoCurta}_

*Principais funcionalidades:*
${bullets}

👉 *Por que usar o Módulo ${modulo.nome}?*
Porque uma igreja saudável organiza processos terrestres para que os milagres celestes encontrem terreno fértil! Toda a liderança acessa em tempo real, pelo computador, tablet ou celular.

*Quer ver uma demonstração gratuita das 41 ferramentas?*
Entre em contato diretamente comigo ou clique no link do sistema:
🌐 Acesse agora: ${urlSistema}
💬 Fale Conosco no WhatsApp: wa.me/${whatsappContato.replace(/\D/g, '')}
📧 E-mail: ${emailSaaS}

Atenciosamente,
*${nomeRevendedor}* - Distribuidor Oficial e Master SaaS do *${nomeSistema}*`;

  // 2. Email Subject and Email HTML
  const emailSubject = `🚀 Revolucione sua Igreja: Conheça o Módulo "${modulo.nome}" do ${nomeSistema}`;
  
  const emailHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Apresentação do Módulo ${modulo.nome}</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 40px 10px;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" style="max-width:600px; background-color:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; border-collapse: collapse;">
                    <!-- HEADER -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); padding: 40px 20px; color:#ffffff;">
                            <span style="font-size:11px; font-weight:800; letter-spacing: 2px; text-transform:uppercase; background-color: rgba(255,255,255,0.15); padding: 5px 12px; border-radius: 999px; display:inline-block; margin-bottom:15px;">DIVULGAÇÃO DE MÓDULOS SaaS</span>
                            <h1 style="margin:0; font-size:28px; font-weight:900; letter-spacing:-0.5px;">Módulo ${modulo.nome}</h1>
                            <p style="margin:10px 0 0 0; font-size:14px; opacity:0.9; font-weight:500;">Exclusivo no ecossistema ${nomeSistema}</p>
                        </td>
                    </tr>
                    
                    <!-- BODY -->
                    <tr>
                        <td style="padding: 40px 30px; color:#334155; line-height:1.6;">
                            <p style="margin:0 0 20px 0; font-size:16px; font-weight:500;">
                                Olá Liderança Eclesiástica,
                            </p>
                            <p style="margin:0 0 24px 0; font-size:15px; color:#475569;">
                                Gerir uma instituição religiosa moderna envolve comunicar, planejar e resguardar dados de forma clara e assertiva. Por isso, temos o prazer de apresentar os detalhes do módulo de <strong>${modulo.nome}</strong>, projetado cirurgicamente como um dos 41 recursos indispensáveis do <strong>${nomeSistema}</strong>.
                            </p>
                            
                            <!-- DESCRICAO RELEVANTE -->
                            <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 18px 24px; border-radius: 0 16px 16px 0; margin-bottom:30px;">
                                <h4 style="margin:0 0 4px 0; font-size:12px; font-weight:800; color:#4f46e5; text-transform:uppercase; letter-spacing:1px;">DO QUE SE TRATA?</h4>
                                <p style="margin:0; font-size:14px; font-weight:600; color:#1e293b;">${modulo.descricaoCurta}</p>
                            </div>
                            
                            <!-- BENEFICIOS -->
                            <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; color:#1e293b; text-transform:uppercase; letter-spacing:0.5px;">Principais Destaques e Recursos:</h3>
                            <ul style="margin:0 0 35px 0; padding-left:20px; font-size:14px; color:#475569; line-height:1.8;">
                                ${bulletsHtml}
                            </ul>
                            
                            <!-- CALL TO ACTION -->
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:35px;">
                                <tr>
                                    <td align="center">
                                        <a href="${urlSistema}" target="_blank" style="background-color:#4f46e5; color:#ffffff; padding: 16px 32px; font-size:14px; font-weight:bold; text-decoration:none; border-radius:14px; display:inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.45); transition: background-color 0.2s;">Experimentar modulo Gratuitamente</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- SUB-LINHOS -->
                            <p style="margin:0 0 15px 0; font-size:12px; color:#64748b; font-weight:500; text-align:center;">
                                Para agendar uma conferência ou treinar seus secretários e tesoureiros, fale conosco no WhatsApp ou responda a este e-mail.
                            </p>
                            
                            <table width="100%" style="border-top: 1px solid #f1f5f9; padding-top:20px;">
                                <tr>
                                    <td style="font-size:12px; color:#64748b;">
                                        <strong>Contato Comercial:</strong> ${whatsappContato}<br>
                                        <strong>Suporte Técnico:</strong> ${emailSaaS}
                                    </td>
                                    <td align="right" style="font-size:12px; color:#64748b; font-weight:700;">
                                        ${nomeRevendedor}<br>
                                        <span style="font-size:10px; font-weight:500; color:#94a3b8;">Distribuidor Master SaaS</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- FOOTER -->
                    <tr>
                        <td align="center" style="background-color:#f8fafc; padding: 25px 20px; border-top: 1px solid #f1f5f9; color:#94a3b8; font-size:11px;">
                            <p style="margin:0 0 5px 0; font-weight:700;">&copy; 1526 - 2026 ${nomeSistema} SaaS Platform.</p>
                            <p style="margin:0;">Desenvolvimento sob regras rígidas de segurança, LGPD e backups periódicos redundantes.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  // 3. Web Push Title and Body
  const pushTitle = `Módulo ${modulo.nome} Ativo! 🚀`;
  const pushBody = `Descubra as vantagens do Módulo de ${modulo.nome} no ${nomeSistema}. Domine os 41 recursos disponíveis! CLIQUE para acessar.`;

  return {
    whatsapp,
    emailSubject,
    emailHtml,
    pushTitle,
    pushBody
  };
};
