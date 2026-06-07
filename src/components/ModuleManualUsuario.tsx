import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Search, ChevronRight, HelpCircle, Users, Wallet, Calendar, 
  MapPin, Bell, Shield, Info, Download, Star, Settings, CheckCircle, 
  AlertTriangle, Lightbulb, Phone, Mail, FileText, FileBarChart, Award, 
  Sparkles, Layers, Cpu, CheckSquare, RefreshCw, Printer, Trash2, Heart,
  Briefcase, MessageSquare, Clipboard, Share2, Eye, Key, Sliders, Database,
  Plus, GraduationCap, Baby, ShieldAlert
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function ModuleManualUsuario() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('introducao');
  const [directoryFilter, setDirectoryFilter] = useState('todos');
  const [directorySearch, setDirectorySearch] = useState('');
  const [isEbookMode, setIsEbookMode] = useState(false);

  // AI manual module states
  const [selectedSubModule, setSelectedSubModule] = useState<any | null>(null);
  const [aiContent, setAiContent] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiCache, setAiCache] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('gipp_manual_ai_cache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const getOfflineDetailedManualFor = (subMod: any) => {
    const cat = subMod.category || 'membros';
    const idStr = subMod.id.toUpperCase();
    const name = subMod.name;
    const desc = subMod.desc;

    let introTexts: string[] = [];
    let steps: string[] = [];
    let securityText = '';
    let securityLevel = '';
    let faqs: { q: string, a: string }[] = [];
    let tips: string[] = [];

    const code = subMod.id.toLowerCase();
    
    if (['k1', 'k2', 'k3', 'ebd1', 'ead1', 'lit1'].includes(code)) {
      if (code === 'k1') {
        introTexts = [
          `O Módulo de Check-in e Check-out Seguro da Salinha Kids (GIPP-K1) oferece proteção incondicional às crianças entregues aos cuidados da igreja durante as liturgias e cultos dominicais.`,
          `Este sistema assegura que apenas responsáveis autorizados e portadores do PIN ou crachá possam retirar os pequenos do recinto de convivência.`
        ];
        steps = [
          `Acesse o painel do líder da Salinha Kids e navegue até a aba Check-in/Out.`,
          `Localize a criança pelo nome ou utilize o crachá cadastral para acionar o check-in.`,
          `Digite o telefone ou PIN secreto do responsável e confirme o registro de entrada na salinha.`,
          `No momento da saída, exija o PIN ou o código numérico impresso para aprovar a conclusão do check-out.`
        ];
        securityLevel = "Líder Kids / Voluntário de Recepção Infantil";
        securityText = `Todos os registros de entrada e saída bloqueiam retiradas sem a apresentação formal do PIN secreto ou documento correspondente, gerando logs imediatos na trilha de auditoria para integridade total.`;
        faqs = [
          { q: "O que fazer se o responsável esqueceu o código PIN?", a: "O líder com permissão de coordenação poderá consultar e resetar o PIN do responsável na ficha de cadastro da criança de forma segura." }
        ];
        tips = [
          "Sempre confira visualmente a pulseira e o crachá antes da saída física.",
          "Auxilie os novos voluntários nas primeiras chamadas do painel."
        ];
      } else if (code === 'k2') {
        introTexts = [
          `O Painel de Relatório de Ocorrências da Salinha Kids (GIPP-K2) fornece para a coordenação ministerial um quadro consolidador analítico de todas as ocorrências e incidentes havidos na semana.`,
          `Desta forma, os pastores e diretores podem planejar treinamentos e adequações de espaço de forma estatisticamente embasada.`
        ];
        steps = [
          `Navegue até a aba Ocorrências no Módulo Salinha Kids.`,
          `Habilite o Painel de Coordenação para visualizar o consolidado estatístico de incidentes.`,
          `Selecione o filtro de período (Diário ou Semanais) para agrupar as ocorrências registradas pelas professoras.`,
          `Clique no botão "Exportar PDF" para emitir o documento timbrado oficial.`
        ];
        securityLevel = "Coordenador Geral Kids / Diretor do Departamento Infantil";
        securityText = `Informações e relatos de incidentes são de cunho confidencial, sendo protegidos por regras rígidas de acesso e sigilo.`;
        faqs = [
          { q: "Quais ocorrências entram no relatório exportado?", a: "Todas as ocorrências registradas na data/semana filtrada, incluindo pendentes, resolvidas e urgentes." }
        ];
        tips = [
          "Verifique se o relato possui descrição fidedigna antes de arquivar ou resolver.",
          "Use os PDFs exportados nas reuniões semanais da diretoria."
        ];
      } else if (code === 'k3') {
        introTexts = [
          `O Módulo de Notificações Ativas de Incidentes da Salinha Kids (GIPP-K3) automatiza a transparência imediata junto aos pais e responsáveis cadastrados.`,
          `Sempre que uma ocorrência grave ou urgente for registrada, o sistema gera disparos sonoros e alertas urgentes no Portal do Membro.`
        ];
        steps = [
          `A professora preenche o formulário de ocorrência infantil correspondente, marcando a gravidade como 'URGENTE'.`,
          `Ao salvar a ocorrência, a engrenagem do GIPP dispara nos canais locais e sonoros do dispositivo dos pais.`,
          `O responsável recebe no Portal do Membro o cabeçalho descritivo com o incidente, sabendo instantaneamente o que houve.`
        ];
        securityLevel = "Professor Kids / Coordenador Local";
        securityText = `Regras de disparos urgentes visam a tranquilidade da família, sendo monitorados por logs de rede para certificar a entrega do sinal de áudio e visual.`;
        faqs = [
          { q: "O som de alerta toca mesmo com o celular bloqueado?", a: "Sim, caso os pais tenham aceitado receber notas visuais e concedido a permissão física para canais de reprodução sonora." }
        ];
        tips = [
          "Evite criar ocorrências qualificadas como urgentes para fatos corriqueiros (ex: sonolência leve).",
          "Mantenha o telefone dos responsáveis sempre atualizado."
        ];
      } else if (code === 'ebd1') {
        introTexts = [
          `O Módulo de Chamada Interativa da EBD (GIPP-EBD1) moderniza o controle de faltas e presenças das classes dominicais da Escola Bíblica.`,
          `Integra em uma única planilha o acompanhamento de ofertas de classe, revistas de estudo estudadas e se o aluno trouxe sua Bíblia.`
        ];
        steps = [
          `Acesse a aba EBD no menu lateral e selecione a Sala e a Lição correspondente ao dia.`,
          `Marque a presença e assinale em 1 clique os itens de Bíblia, Revista e Oferta Voluntária.`,
          `Visualize em tempo real o gráfico demonstrando a oscilação de presença da classe dominical.`,
          `No encerramento das aulas, publique as medalhas aos alunos de destaque (Aluno Ouro/Prata/Bronze).`
        ];
        securityLevel = "Professor Titular EBD / Superintendente de Escola";
        securityText = `As planilhas de chamadas salvam históricos permanentes cruciais para a análise espiritual de dedicação bíblica local.`;
        faqs = [
          { q: "Como um aluno recebe a insígnia Aluno Ouro?", a: "Mantendo presença exemplar e trazendo Bíblia sagrada, revista de estudos de classe e ofertas ordinárias acumuladas." }
        ];
        tips = [
          "Utilize o lançamento rápido de chamada para evitar atrasos na programação.",
          "Incentive os pais a apoiarem as crianças no preenchimento de suas revistas."
        ];
      } else if (code === 'ead1') {
        introTexts = [
          `O Módulo de Cursos EAD e Teologia Acadêmica GIPP (GIPP-EAD1) democratiza o ensino sistemático aos voluntários locais.`,
          `Com trilhas integradas de apologética CPAD, quizes dinâmicos e emissão de certificados timbrados, o desenvolvimento teológico é impulsionado.`
        ];
        steps = [
          `O aluno acessa o ambiente EAD e escolhe o curso ativo de sua preferência.`,
          `Assiste ou lê o material de ementa contido em cada módulo dinâmico do curso e lição.`,
          `Responde ao quiz de fixação doutrinária demonstrando seus saberes teológicos acumulados.`,
          `Ao concluir com nota ideal, solicita e faz o download de seu certificado HD com bordaduras.`
        ];
        securityLevel = "Líder Pedagógico / Diretor de Capacitação e Ensino";
        securityText = `O controle de avaliações e nota de aproveitamento dos cursos impede a emissão inadequada de certificados eclesiásticos oficiais.`;
        faqs = [
          { q: "Quais tipos de cursos podem ser oferecidos no EAD?", a: "Cursos de Capacitação de Obreiros, Evangelismo Urbano, Defesa da Fé Cristã e Teologia Sistemática de Base." }
        ];
        tips = [
          "Recomende a leitura cuidadosa dos quizes e textos de apoio antes de responder.",
          "Imprima os certificados em papel fosco texturizado de alta qualidade."
        ];
      } else if (code === 'lit1') {
        introTexts = [
          `O Planeamento Litúrgico e Sermões Litúrgicos (GIPP-LIT1) unifica os rituais semanais dos templos dominicais.`,
          `Evita sobreposições ou redundâncias de playlists de cânticos ou de temas homiléticos, criando um arquivo contínuo de temas pregados.`
        ];
        steps = [
          `Acesse a aba de Planeamento Litúrgico no Portal do Pastor.`,
          `Insira o tema do culto, indique o orador oficial, o dirigente de louvor e a seleção de hinos sugeridos.`,
          `Anexe o resumo teológico ou roteiro da homilia que será partilhada com os irmãos.`,
          `Imprima ou envie o cronograma oficial em formato PDF por WhatsApp para o corpo de diaconato.`
        ];
        securityLevel = "Pastor Presidente / Ministro de Louvor / Diácono do Altar";
        securityText = `A visualização e agendamento de pregações resguarda a organização doutrinária do ministério, evitando repetições involuntárias.`;
        faqs = [
          { q: "Como integrar com a coordenação de louvor?", a: "O ministro de música pode ver pelo painel as canções agendadas para ensaiar com os instrumentistas previamente." }
        ];
        tips = [
          "Preencha o cronograma litúrgico com pelo menos 48h de antecedência.",
          "O roteiro do sermão pode ser consultado de forma responsiva no próprio smartphone durante a pregação."
        ];
      }
    } else if (cat === 'membros') {
      introTexts = [
        `O Módulo de Cadastro de Membros e CRM (GIPP-${idStr}) compreende um componente estratégico essencial para o amparo e governança das almas no corpo da congregação. A preservação de fichas atualizadas atua diretamente na unificação das ordens de batismo, filiações e históricos ministeriais sob preceitos rígidos de organização.`,
        `Através do recurso de "${name}", a igreja consegue executar as seguintes diretrizes: ${desc}. Este fluxo de trabalho foi calibrado de forma sistêmica para integrar todas as informações sem perda de dados históricos, promovendo a total fidelidade e cuidado pastoral no Rol de Membros.`,
        `O uso constante deste ambiente reduz falhas de duplicação, automatiza o cálculo de taxas e prazos de comunhão, e permite a emissão rápida de documentos timbrados. O GIPP sincroniza esses dados de membresia em tempo real, fornecendo aos pastores as métricas consolidadas necessárias para o bom andamento do ministério local.`
      ];
      steps = [
        `Acesse a seção de Rol de Membros e Membresia no menu administrativo principal do GIPP.`,
        `Abra o painel referente a "${name}" clicando em seu ícone ou atalho no diretório corporativo de ferramentas.`,
        `Digite as informações cadastrais requeridas com cuidado e perfeição, evitando abreviações informativas nas fichas.`,
        `Efetue o salvamento da alteração e aguarde a indicação visual de integridade síncrona gerada no banco de dados local.`
      ];
      securityLevel = "Secretaria Geral / Pastor de Congregação";
      securityText = `Todas as operações de membros e CRM (GIPP-${idStr}) registram instantaneamente seu operador na trilha de auditoria. O acesso exige permissão ativa de Secretaria para a gravação ou modificação de dados civis e familiares, respeitando de forma integral as resoluções vigentes da LGPD.`;
      faqs = [
        {
          q: `Como restabelecer um cadastro de membro modificado ou removido acidentalmente via "${name}"?`,
          a: `O sistema possui uma Lixeira Virtual ativa no sub-módulo GIPP-S_S5. Todos os membros editados ou suspensos temporariamente permanecem em quarentena de segurança por 90 dias, de onde podem ser prontamente restaurados em um único clique.`
        },
        {
          q: `Este sub-módulo de membresia funciona sem conexão de rede de Internet?`,
          a: `Sim. O GIPP possui arquitetura offline-first nativa com armazenamento espelhado em IndexedDB. Seus cadastros e alterações no recurso "${name}" continuam operando de forma perfeita e sincronizam com a nuvem assim que detectado sinal de rede.`
        }
      ];
      tips = [
        `Recomenda-se realizar uma auditoria trimestral nas fichas para garantir telefones e laços parentais atualizados.`,
        `Aproveite as escalas integradas do Rol com disparo via WhatsApp para manter obreiros sempre informados.`
      ];
    } else if (cat === 'financeiro') {
      introTexts = [
        `O Módulo de Tesouraria Integrada e Balancetes Oficiais (GIPP-${idStr}) consolida o mais alto padrão em conformidade contábil e mordomia eclesiástica do país. A administração do faturamento e saídas operacionais é pautada em responsabilidade fiscal absoluta e transparência junto aos órgãos de controle.`,
        `A aplicação prática do recurso de "${name}" atua sobre o cenário de: ${desc}. Com total fidelidade matemática, cada lançamento nominal de receita ou dedução flui diretamente para a consolidação de gráficos trimestrais do DRE e livro-caixa unificado da sede administrativa.`,
        `Ao digitalizar esses movimentos financeiros, o templo afasta erros operacionais comuns provocados por contabilidade em cadernos e planilhas desvinculadas. A rede GIPP assegura tráfego criptografado e validações de integridade que garantem a exatidão visual das movimentações prestadas.`
      ];
      steps = [
        `Localize o painel de Tesouraria e Finanças no diretório unificado e abra o assistente do recurso "${name}".`,
        `Verifique os comprovantes de depósitos, dízimos, ofertas pastorais ou faturas de despesa, digitando os deltas e valores correspondentes.`,
        `Utilize a conciliação automatizada de códigos se disponíveis ou anexe o comprovante físico digitalizado.`,
        `Clique no botão 'Gravar Registro Financeiro'. O sistema processará logs de caixa fechado e calculará o superávit síncrono.`
      ];
      securityLevel = "Tesoureiro Local / Administrador Master";
      securityText = `Regras estritas de conformidade administrativa limitam operações em GIPP-${idStr} aos cargos de tesouraria de Sede e permissão Master do pastor titular. Nenhuma alteração de valor de dízimo ou oferta prescinde do registro de auditoria permanente no ledger criptográfico do banco.`;
      faqs = [
        {
          q: `Como retificar ou efetuar o estorno de um lançamento ou valor que foi digitado de forma errônea neste menu?`,
          a: `Para preservar a autenticidade fiscal, o GIPP impossibilita exclusões diretas em livros. Recomenda-se abrir o menu, selecionar o registro e iniciar um 'Lançamento de Contrapartida/Estorno Autoritário' com justificativa detalhada para o conselho fiscal.`
        },
        {
          q: `Os gráficos visuais e demonstrativos contam com atualização imediata após salvar transações via "${name}"?`,
          a: `Sim. Toda a engrenagem de faturamento, pizza de despesas por centro de custos e curvas de sazonalidade sintonizam em frações de milissegundos no banco de dados, prontas para visualização instantânea de relatórios.`
        }
      ];
      tips = [
        `Lembre-se de anexar as fotos de recibos e boletos no sistema para agilizar as reuniões mensais do conselho de contas.`,
        `Utilize o painel de previsão orçamentária anual do GIPP para planejar aquisições físicas de forma segura.`
      ];
    } else if (cat === 'celulas') {
      introTexts = [
        `O Módulo de Supervisão de Pequenos Grupos e Redes Geográficas (GIPP-${idStr}) organiza a logística eclesiástica de crescimento descentralizado. O acompanhamento síncrono das congregações nos lares é peça-chave para a integração ativa de membros, visitantes e consolidação de obreiros locais.`,
        `O sub-módulo de "${name}" atua diretamente provendo: ${desc}. Este ambiente simplifica o recebimento de presenças, relatórios semanais de consolidados, pedidos de oração das reuniões e ofertas locais destinadas ao avanço da rede.`,
        `A total sintonia entre o Rol de Membros oficial e as redes de pequenos grupos dinamiza a velocidade de tomada de decisões da coordenação, impedindo o absenteísmo silencioso de frequentadores e facilitando a multiplicação sadia e ordenada.`
      ];
      steps = [
        `Abra o menu 'Células e Redes' ou selecione o atalho rápido do aplicativo em seu dispositivo de campo.`,
        `Clique sobre "${name}" para carregar as informações do distrito, anfitriões residenciais ou área sob sua coordenação.`,
        `Preencha o quorum nominal de participantes presentes, novos visitantes integrados e detalhes das ofertas colhidas.`,
        `Submeta o relatório semanal da célula. O supervisor de rede receberá o informativo consolidado automaticamente no celular.`
      ];
      securityLevel = "Líder de Célula / Supervisor de Área / Coordenador Regional";
      securityText = `O acesso operacional do GIPP-${idStr} é provido diretamente ao líder devidamente credenciado e supervisionado pela coordenação. Os dados geodemográficos e residências de anfitriões obedecem aos critérios internos de discrição e sigilo corporativo.`;
      faqs = [
        {
          q: `O que ocorre se o quorum de participantes de uma reunião de célula exceder o teto ideal?`,
          a: `O GIPP possui um algoritmo preventivo de multiplicação. Ao registrar mais de 15 pessoas frequentes por 3 semanas consecutivas em "${name}", o supervisor recebe um alerta instigando o planejamento de divisão saudável em duas frentes de atuação.`
        },
        {
          q: `Como associar novos visitantes cadastrados na reunião domiciliar diretamente ao Rol Oficial da Sede?`,
          a: `Basta converter o visitante para a ficha de membros clicando em 'Integrar ao Rol' dentro do cadastro de CRM. O histórico obtido no pequeno grupo flui integralmente para o prontuário pastoral permanente do indivíduo.`
        }
      ];
      tips = [
        `Mantenha os canais de intercessão e oração das reuniões de célula atualizados no cadastro para amparo ministerial rápido.`,
        `Crie dinâmicas e confraternizações frequentes utilizando o cronograma de lanches e eventos integrado do GIPP.`
      ];
    } else if (cat === 'secretaria') {
      introTexts = [
        `O Módulo de Secretaria Clerical, Métricas de EBD e Agendas Síncronas (GIPP-${idStr}) compreende a engrenagem burocrática integradora de escalas e ensino doutrinário eclesiástico. Ele garante de forma unificada que a liturgia, eventos, templos e assembleias operem em alta performance sem conflito de alocação de equipes.`,
        `Desta forma, o recurso de "${name}" é um utilitário destinado ao andamento da seguinte diretriz GIPP: ${desc}. Através dele, a secretaria centraliza informações, gera termos de membresia e gerencia o cronograma contínuo de aulas da Escola Bíblica.`,
        `Com foco em agilizar as tarefas cotidianas da igreja local, o ambiente é interligado com disparadores automatizados via canais WhatsApp, otimizando o aviso de voluntários nas escalas semanais de som, recepção e diaconato.`
      ];
      steps = [
        `Acesse os recursos de Secretaria e Escola Dominical através do menu dinâmico da aplicação.`,
        `Selecione o painel correspondente a "${name}" e confira as grades cronológicas ou formulários em exibição.`,
        `Efetue os agendamentos requeridos, matrículas de alunos dominicais ou escalas de diaconato, certificando-se de não sobrepor nomes.`,
        `Gere a publicação ou emita a via digital oficial (ex: cartões de membresia, relatórios ou certificados pdf timbrados).`
      ];
      securityLevel = "Secretária Administrativa / Professor Titular / Pastor Auxiliar";
      securityText = `As permissões de escrita em GIPP-${idStr} são liberadas mediante cadastro formal efetuado pela pastoria. Modificações em atas ordinárias ou agendação em lotes passam por controle de segurança para evitar cancelamentos acidentais de reuniões.`;
      faqs = [
        {
          q: `Como evitar problemas de duplicidade de voluntários nas escalas semanais usando o "${name}"?`,
          a: `O GIPP valida as escalas e agendas de forma síncrona. Caso tente alocar o mesmo músico para ensaios ou cultos conflitantes, o formulário gera um alerta em tempo real de indisponibilidade do operador, resguardando o andamento das reuniões.`
        },
        {
          q: `Como disparar notificações e agendas aos obreiros de forma automática via WhatsApp?`,
          a: `Clique no botão 'Disparar Lembretes' existente no cabeçalho das escalas. O sistema monta o texto estruturado e abre o link de disparo do mensageiro instantâneo com todos os dados preenchidos de forma expressa.`
        }
      ];
      tips = [
        `Configure as datas recorrentes de cultos ordinários na agenda no início do ano para reservar auditórios com antecedência.`,
        `Forneça relatórios do andamento pedagógico da EBD nas assembleias pastorais mensais para tomada de decisões doutrinárias.`
      ];
    } else if (cat === 'ai') {
      introTexts = [
        `O Módulo de Serviços Inteligentes e Elaboração de Esboços por IA (GIPP-${idStr}) traz o que há de mais moderno em processamento de linguagem natural (NLP) para agilizar as tarefas pastorais e intelectuais da igreja local. Trata-se de um assistente teológico de alta performance pautado sobre éticas doutrinárias sérias.`,
        `A finalidade central do sub-módulo de "${name}" consiste em apoiar a congregação no escopo de: ${desc}. O assistente gera subsídios textuais homiléticos, resumos de atas administrativas de conselhos de contas, devocionais estruturados de fé e auxílio nos boletins ministeriais.`,
        `É de extrema relevância frisar que a ferramenta atua de forma estritamente auxiliar ao pastor encarregado. O discernimento e direção espiritual nos aconselhamentos ou sermões residem no operador humano, cabendo ao GIPP fornecer a síntese e a aceleração criativa dos roteiros.`
      ];
      steps = [
        `Abra o centro de inteligência artificial ou painel homilético GIPP.`,
        `Selecione a ferramenta de "${name}" para carregar o console interativo de digitação e geração de prompts.`,
        `Digite o tema central, as passagens ou o áudio gravado necessário, determinando as diretrizes doutrinárias da pesquisa.`,
        `Clique no botão 'Processar com Gemini Inteligência Eclesiástica' e copie o esboço teológico ou boletim gerado para seu clipboard.`
      ];
      securityLevel = "Pastor Titular / Líder Ministério Jovem / Evangelista Autorizado";
      securityText = `Consultas efetuadas in GIPP-${idStr} são processadas em ambiente server-side com criptografia simétrica de ponta-a-ponta. Os inputs de aconselhamento pastoral pastoral são protegidos sob severo sigilo de dados de membresia de acordo com as leis LGPD vigentes.`;
      faqs = [
        {
          q: `Qual é o modelo e motor de inteligência artificial adotado para as gerações dinâmicas de "${name}"?`,
          a: `O GIPP incorpora a poderosa API integrada do Google Gemini 3.5, configurada especificamente com regras de teologia de alianças e semânticas eclesiásticas ordenadas para impedir termos inadequados.`
        },
        {
          q: `Por que as gerações de devocionais e esboços homiléticos são gratuitas aos pastores da suíte?`,
          a: `A infraestrutura do GIPP unifica os limites de quota do Google AI Studio de forma server-side oculta do navegador. Isso garante alta performance e gratuidade contínua para as congregações parceiras.`
        }
      ];
      tips = [
        `Combine o esboçador de sermões com o módulo de recomendação inteligente de louvores para uma liturgia totalmente integrada.`,
        `Use o conversor automático de atas por áudio do GIPP para registrar assembleias de obreiros sem cansar o secretário.`
      ];
    } else {
      introTexts = [
        `O Módulo de Governança Administrativa, Logs de Auditoria e Backups Críticos (GIPP-${idStr}) consolida o painel de controle mestre da suíte eclesiástica GIPP. Ele funciona como o guardião de integridade lógica do sistema, mantendo a integridade das conexões e operabilidade offline.`,
        `A finalidade elementar de "${name}" é resguardar a congregação nos quesitos de: ${desc}. O utilitário disponibiliza configurações de temas do portal, permissões de operadores, trilhas síncronas antes/depois e chaves criptográficas de API de alta segurança bancária.`,
        `Através de manutenções preventivas, sincronizações de banco IndexedDB no navegador e criação automatizada de chaves ou restauradores, o ecossistema GIPP assegura resiliência total contra fraudes financeiras e acidentes com exclusões na nuvem.`
      ];
      steps = [
        `Acesse a central administrativa e configurações de segurança com senha Master autorizada.`,
        `Selecione o utilitário de "${name}" no diretório para carregar a tela de parametrização ou log de auditoria.`,
        `Efetue as modificações requeridas para o fuso horário, dados de servidores Firebase FCM ou triggers de backups offline em arquivos.`,
        `Save as preferências contidas no formulário. O sistema limpará os caches locais velhos e aplicará a nova diretriz de governança.`
      ];
      securityLevel = "Administrador Master / Desenvolvedor GIPP";
      securityText = `As ferramentas contidas em GIPP-${idStr} operam em zonas críticas de dados. O painel exige credenciais nível Master com ativação de verificação em duas etapas (2FA) para habilitar mudanças fundamentais da carteira contábil.`;
      faqs = [
        {
          q: `Como é obtida a Trilha de Auditoria detalhada do operador?`,
          a: `O banco armazena o estado anterior (Antes) e posterior (Depois) de todo dízimo, membro ou escala editada. Isso permite auditar e rever desvios com data, hora, IP da máquina e nome completo do operador.`
        },
        {
          q: `Em quais situações recomenda-se fazer o Backup completo em formato JSON via "${name}"?`,
          a: `É prudente efetuar downloads de backup do arquivo eclesiástico antes de iniciar grandes reformulações de cargo ou importações externas em lote, servindo de salvaguarda imediata livre offline.`
        }
      ];
      tips = [
        `Mantenha sua chave cadastral de API sob sigilo e nunca digite a credencial de segurança em chats ou telas compartilhadas.`,
        `Use a lixeira inteligente com quarentena de 90 dias antes de optar por exclusões permanentes da base de dados.`
      ];
    }

    return {
      module: `GIPP-${idStr}`,
      index: [
        { anchor: "introducao", title: "1. Introdução e Propósito Ministerial" },
        { anchor: "operacao", title: "2. Guia Passo a Passo de Operação" },
        { anchor: "seguranca", title: "3. Controle de Segurança e Governança" },
        { anchor: "faq", title: "4. Resolução de Dúvidas Práticas (FAQ)" },
        { anchor: "sugestoes", title: "5. Recomendações de Excelência Administrativa" }
      ],
      sections: [
        {
          anchor: "introducao",
          title: "1. Introdução e Propósito Ministerial",
          content: introTexts.join('\n\n')
        },
        {
          anchor: "operacao",
          title: "2. Guia Passo a Passo de Operação",
          steps: steps
        },
        {
          anchor: "seguranca",
          title: "3. Controle de Segurança e Governança",
          content: securityText,
          levelRequired: securityLevel
        },
        {
          anchor: "faq",
          title: "4. Resolução de Dúvidas Práticas (FAQ)",
          questions: faqs
        },
        {
          anchor: "sugestoes",
          title: "5. Recomendações de Excelência Administrativa",
          tips: tips
        }
      ]
    };
  };

  const generateAiContent = async (subMod: any, forceOnline: boolean = false) => {
    const cacheKey = subMod.id;

    if (!forceOnline) {
      if (aiCache[cacheKey]) {
        setAiContent(aiCache[cacheKey]);
        setAiError(null);
        return;
      }
      // Instant Offline Manual Generator
      const offlineManual = getOfflineDetailedManualFor(subMod);
      setAiContent(offlineManual);
      setAiError(null);
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiContent(null);

    const promptText = `Gere um guia oficial de usuário completo e extremamente detalhado para o seguinte módulo do sistema GIPP (Gestão Integrada de Portais):
Módulo ID: GIPP-${subMod.id.toUpperCase()}
Nome do Recurso: ${subMod.name}
Categoria/Contexto: ${subMod.category}
Resumo do Recurso: ${subMod.desc}

O conteúdo deve ser retornado ESTREITAMENTE em formato JSON (sem blocos Markdown adicionais além do próprio texto, apenas responda com o objeto JSON puro). O esquema JSON obrigatório deve ser:
{
  "module": "GIPP-${subMod.id.toUpperCase()}",
  "index": [
    {"anchor": "introducao", "title": "1. Introdução e Propósito Ministerial"},
    {"anchor": "operacao", "title": "2. Guia Passo a Passo de Operação"},
    {"anchor": "seguranca", "title": "3. Controle de Segurança e Governança"},
    {"anchor": "faq", "title": "4. Resolução de Dúvidas Práticas (FAQ)"},
    {"anchor": "sugestoes", "title": "5. Recomendações de Excelência Administrativa"}
  ],
  "sections": [
    {
      "anchor": "introducao",
      "title": "1. Introdução e Propósito Ministerial",
      "content": "Escreva um texto aprofundado, pastoral e técnico (mínimo de 3 parágrafos robustos) descrevendo o objetivo eclesiológico e operacional deste recurso no cotidiano da igreja, os benefícios de sua aplicação e sua importância para a transparência do ministério no sistema GIPP."
    },
    {
      "anchor": "operacao",
      "title": "2. Guia Passo a Passo de Operação",
      "steps": [
        "Identifique a aba ou atalho no painel eclesiástico GIPP e clique para abrir o respectivo editor do módulo.",
        "Preencha todos os campos obrigatórios com atenção e capricho, evitando informações informais ou abreviações.",
        "Verifique a validação síncrona visual gerada pelo sistema (indicador verde de integridade de formulários).",
        "Clique em 'Salvar Transação' ou 'Efetuar Registro' e certifique-se de que o log de auditoria correspondente gravou as alterações."
      ]
    },
    {
      "anchor": "seguranca",
      "title": "3. Controle de Segurança e Governança",
      "content": "Para este módulo, de acordo com as regras de compliance GIPP, o privilégio limita-se ao papel eclesiástico atribuído de forma oficial. Logs detalhados registram ações fiscais e de membresia para salvaguardar o ministério sob os limites estritos da LGPD.",
      "levelRequired": "Nivel Administrativo Recomendado (Master, Tesoureiro ou Secretaria)"
    },
    {
      "anchor": "faq",
      "title": "4. Resolução de Dúvidas Práticas (FAQ)",
      "questions": [
        {
          "q": "O que fazer se o registro falhar por oscilações diárias ou sinal?",
          "a": "O GIPP possui arquitetura offline-first nativa com armazenamento em IndexedDB."
        }
      ]
    },
    {
      "anchor": "sugestoes",
      "title": "5. Recomendações de Excelência Administrativa",
      "tips": [
        "Lembre-se de realizar revisões regulares e auditorias com o Conselho Fiscal para garantir integridade."
      ]
    }
  ]
}

Responda pura e estritamente com o objeto JSON estruturado acima para que eu possa fazer JSON.parse() diretamente. Não inclua \`\`\`json no início ou fim da resposta.`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: promptText })
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor Gemini. Verifique a chave de API.');
      }

      const val = await response.json();
      if (val.error) {
        throw new Error(val.error);
      }

      let text = val.text || '';
      text = text.replace(/^\s*```json?/i, '').replace(/```\s*$/, '').trim();

      const parsed = JSON.parse(text);
      
      const updatedCache = { ...aiCache, [cacheKey]: parsed };
      setAiCache(updatedCache);
      try {
        localStorage.setItem('gipp_manual_ai_cache', JSON.stringify(updatedCache));
      } catch (e) {
        console.warn('LocalStorage limit exceeded:', e);
      }
      
      setAiContent(parsed);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Erro inesperado na geração do manual de IA.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportPdf = (sections: any[], gModules: any[]) => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      let currentPage = 1;

      // Cover Page Design
      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, 595, 842, 'F');

      doc.setFillColor(99, 102, 241);
      doc.rect(40, 220, 8, 120, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(199, 210, 254);
      doc.text('SUITE CORPORATIVA GIPP', 60, 240);

      doc.setFontSize(26);
      doc.setTextColor(255, 255, 255);
      doc.text('E-Book do Manual Oficial', 60, 275);
      doc.text('Consolidado de Governança', 60, 310);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(156, 163, 175);
      doc.text('Manual de Operação Expandido Unificado de 130+ Sub-módulos e Guias', 60, 345);
      doc.text('Faturamento, Rol de Membros, CRM, Escolas EBD e Inteligência Artificial', 60, 365);

      doc.setFillColor(30, 41, 59);
      doc.rect(40, 540, 515, 1, 'F');

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('Suporte Central GIPP: patrickrodack@gmail.com', 60, 570);
      doc.text('Gerações baseadas nas configurações padrão do sistema', 60, 585);
      doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 60, 600);

      const addHeaderAndFooter = (pdfDoc: any, pageNum: number) => {
        pdfDoc.setFillColor(248, 250, 252);
        pdfDoc.rect(0, 0, 595, 45, 'F');
        
        pdfDoc.setTextColor(100, 116, 139);
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setFontSize(8);
        pdfDoc.text('REDE GIPP - MANUAL DE GOVERNANÇA EXPANDIDO (E-BOOK)', 40, 26);
        pdfDoc.text(`PÁGINA ${pageNum}`, 520, 26);

        pdfDoc.setFillColor(241, 245, 249);
        pdfDoc.rect(0, 45, 595, 1, 'F');
      };

      sections.forEach((section) => {
        doc.addPage();
        currentPage++;
        addHeaderAndFooter(doc, currentPage);

        // Chapter Title
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`${section.title.toUpperCase()}`, 40, 85);

        // Underline divider
        doc.setFillColor(99, 102, 241);
        doc.rect(40, 95, 515, 2, 'F');

        let y = 120;

        // Structured text gathering
        let textLines: { text: string; style?: 'title' | 'bold' | 'normal' | 'bullet' }[] = [];

        if (section.id === 'introducao') {
          textLines.push({ text: "Visão Geral & Arquitetura de Redes GIPP", style: 'title' });
          textLines.push({ text: "Bem-vindo ao manual completo de operação do GIPP. Este é o e-book centralizado de governança ministerial desenvolvido para servir como o núcleo operacional e contábil de sua congregação, unindo de forma perfeita segurança de chaves, acessibilidade remota offline-first e total fidelidade pastorícia." });
          textLines.push({ text: "" });
          textLines.push({ text: "Diretrizes e Premissas Tecnológicas do Sistema:", style: 'bold' });
          textLines.push({ text: "- Banco de Dados Distribuído: Garante que as filiais operem de modo síncrono e integrado.", style: 'bullet' });
          textLines.push({ text: "- Tecnologia Offline-First Nativa: Permite operar cadastros, faturamento e agendas mesmo sem sinal de internet ativo.", style: 'bullet' });
          textLines.push({ text: "- Trilha de Auditoria com Deltas: Segurança robusta que logs todas as ações mantendo o antes e depois das transações no banco.", style: 'bullet' });
        } else if (section.id === 'diretorio') {
          textLines.push({ text: "Diretório Geral de Recursos (200+ Sub-módulos GIPP)", style: 'title' });
          textLines.push({ text: "O ecossistema GIPP possui uma arquitetura modular robusta projetada sob medida para atender 100% das necessidades eclesiásticas. Abaixo listamos as atribuições estáticas chaves de nossos sub-módulos corporativos estruturados por áreas administrativas:" });
          textLines.push({ text: "" });

          const sampledModules = gModules.slice(0, 35);
          sampledModules.forEach((m) => {
            textLines.push({ text: `[GIPP-${m.id.toUpperCase()}] ${m.name}: ${m.desc}`, style: 'bullet' });
          });
          textLines.push({ text: "... e dezenas de outros sub-módulos integrados diretamente ao sistema (detalhados nas seções correspondentes deste e-book)." });
        } else {
          // It's members, financial, cells, etc. We will print the intro, and then print EVERY SINGLE ONE of its submodules expanded!
          textLines.push({ text: `Detalhamento Geral da Área: ${section.title}`, style: 'title' });
          textLines.push({ text: "Este capítulo consolida todas as funções operacionais, boas práticas de segurança, perguntas frequentes e passos sequenciais ordenados para a total governança do departamento." });
          textLines.push({ text: "" });

          // get matching sub-modules
          let submods = [];
          if (section.id === 'credenciais') {
            submods = gModules.filter(m => 
              ['m18', 'm20', 'f21', 'c19', 's4', 's5', 's16', 's18', 's19', 's_s8'].includes(m.id) ||
              m.name.toLowerCase().includes('carteir') || 
              m.name.toLowerCase().includes('credenci') || 
              m.name.toLowerCase().includes('patrim')
            );
          } else if (section.id === 'faq') {
            submods = [];
            textLines.push({ text: "Perguntas de Operação Geral:", style: 'bold' });
            textLines.push({ text: "P: Como habilitar os módulos no sistema da congregação?", style: 'bold' });
            textLines.push({ text: "R: No Painel Master SaaS desenvolvedor, o administrador pode mapear as permissões de cada plano de forma imediata (Básico, Standard, Avançado), atualizando as telas de forma síncrona." });
            textLines.push({ text: "" });
            textLines.push({ text: "P: Os backups são guardados de forma segura?", style: 'bold' });
            textLines.push({ text: "R: O GIPP criptografa todas as saídas de banco locais. Os arquivos JSON baixados podem ser arquivados em discos externos com garantia total." });
          } else {
            submods = gModules.filter(m => m.category === section.id);
          }

          if (submods.length > 0) {
            textLines.push({ text: `Abaixo segue o guia oficial completo dos ${submods.length} sub-módulos que integram esta divisão:`, style: 'bold' });
            textLines.push({ text: "" });

            submods.forEach((sm) => {
              const info = getOfflineDetailedManualFor(sm);
              textLines.push({ text: `SUB-MÓDULO GIPP-${sm.id.toUpperCase()}: ${sm.name}`, style: 'title' });
              textLines.push({ text: `Descrição Técnica: ${sm.desc}` });
              textLines.push({ text: "" });

              // Find step section
              const stepSec = info.sections.find((s: any) => s.anchor === 'operacao');
              if (stepSec && stepSec.steps) {
                textLines.push({ text: "Passo a Passo de Operação:", style: 'bold' });
                stepSec.steps.forEach((st: string, sidx: number) => {
                  textLines.push({ text: `${sidx + 1}. ${st}`, style: 'bullet' });
                });
              }

              // Find security section
              const secSec = info.sections.find((s: any) => s.anchor === 'seguranca');
              if (secSec) {
                textLines.push({ text: "Segurança e Governança:", style: 'bold' });
                textLines.push({ text: `Cargo Recomendado: ${secSec.levelRequired || 'Administração Geral'}` });
                textLines.push({ text: secSec.content });
              }

              // Find FAQ
              const faqSec = info.sections.find((s: any) => s.anchor === 'faq');
              if (faqSec && faqSec.questions) {
                textLines.push({ text: "Dúvidas Frequentes do Recurso:", style: 'bold' });
                faqSec.questions.forEach((q: any) => {
                  textLines.push({ text: `P: ${q.q}`, style: 'bold' });
                  textLines.push({ text: `R: ${q.a}` });
                });
              }

              // Find suggestions
              const sugSec = info.sections.find((s: any) => s.anchor === 'sugestoes');
              if (sugSec && sugSec.tips) {
                textLines.push({ text: "Conselho de Excelência:", style: 'bold' });
                sugSec.tips.forEach((tp: string) => {
                  textLines.push({ text: `* ${tp}`, style: 'bullet' });
                });
              }

              textLines.push({ text: "--------------------------------------------------------", style: 'normal' });
              textLines.push({ text: "" });
            });
          }
        }

        // Output lines to document
        textLines.forEach(item => {
          if (!item.text) {
            y += 10;
            return;
          }

          // Format fonts based on style
          if (item.style === 'title') {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(30, 41, 59);
          } else if (item.style === 'bold') {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(51, 65, 85);
          } else if (item.style === 'bullet') {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(71, 85, 105);
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(71, 85, 105);
          }

          const wrapped = doc.splitTextToSize(item.text, 515);
          if (y + (wrapped.length * 13) > 780) {
            doc.addPage();
            currentPage++;
            addHeaderAndFooter(doc, currentPage);
            y = 70;

            // Restore font weights for wrapped text on new page
            if (item.style === 'title') {
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(11);
              doc.setTextColor(30, 41, 59);
            } else if (item.style === 'bold') {
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(9.5);
              doc.setTextColor(51, 65, 85);
            } else {
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(9);
              doc.setTextColor(71, 85, 105);
            }
          }

          doc.text(wrapped, 40, y);
          y += (wrapped.length * 13) + 5;
        });
      });

      doc.save('manual_ebook_completo_gipp.pdf');
    } catch (e) {
      console.error('PDF Conversion error:', e);
      alert('Erro ao exportar PDF. Por favor, utilize o botão "Imprimir via Navegador" para salvar como PDF corporativo.');
    }
  };


  const renderCategorySubModules = (chapterId: string) => {
    let modules = [];
    if (chapterId === 'credenciais') {
      modules = ALL_GIPP_MODULES.filter(m => 
        ['m18', 'm20', 'f21', 'c19', 's4', 's5', 's16', 's18', 's19', 's_s8'].includes(m.id) ||
        m.name.toLowerCase().includes('carteir') || 
        m.name.toLowerCase().includes('credenci') || 
        m.name.toLowerCase().includes('patrim') ||
        m.desc.toLowerCase().includes('carteir') ||
        m.desc.toLowerCase().includes('patrim')
      );
    } else if (chapterId === 'recursos_expandidos') {
      modules = ALL_GIPP_MODULES.filter(m => ['k1', 'k2', 'k3', 'ebd1', 'ead1', 'lit1'].includes(m.id));
    } else {
      modules = ALL_GIPP_MODULES.filter(m => m.category === chapterId);
    }

    if (modules.length === 0) return null;

    return (
      <div className="mt-8 pt-6 border-t border-slate-150 space-y-4 no-print text-left">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-600 animate-pulse" />
            Explorar Guias Detalhados via IA ({modules.length} Módulos)
          </h4>
          <span className="text-[10px] text-slate-400 font-bold bg-indigo-50 border border-indigo-100 py-0.5 px-2 rounded-md">Gemini 3.5-Flash</span>
        </div>
        
        <p className="text-[11px] text-slate-500 font-bold leading-normal">
          Clique em qualquer recurso complementar abaixo para que a IA analise suas diretrizes e elabore um guia de operacao sob medida com indice próprio, passo a passo síncrono e perguntas frequentes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
          {modules.map(mod => (
            <div 
              key={mod.id} 
              onClick={() => {
                setSelectedSubModule(mod);
                generateAiContent(mod);
              }}
              className="p-3 bg-slate-50 hover:bg-indigo-50/30 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all cursor-pointer flex justify-between items-start group text-left"
            >
              <div className="space-y-1 min-w-0 pr-2">
                <span className="text-[9px] font-black text-indigo-600 block">GIPP-{mod.id.toUpperCase()}</span>
                <span className="text-xs font-black text-slate-800 group-hover:text-indigo-950 block transition-colors truncate">{mod.name}</span>
                <p className="text-[10px] text-slate-400 font-medium leading-snug line-clamp-2">{mod.desc}</p>
              </div>
              <div className="p-1.5 bg-white border border-slate-150 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-400 shrink-0 self-center">
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAiManualView = () => {
    if (!selectedSubModule) return null;

    const mod = selectedSubModule;

    return (
      <div className="space-y-6">
        {/* Breadcrumb / Nav */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-150 text-xs no-print text-left">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
            <BookOpen size={14} />
            <span>Manual GIPP</span>
            <ChevronRight size={10} />
            <span className="text-indigo-600">Manual IA GIPP-{mod.id.toUpperCase()}</span>
          </div>
          <button 
            onClick={() => {
              setSelectedSubModule(null);
              setAiContent(null);
              setAiError(null);
            }}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 font-extrabold rounded-md hover:bg-slate-100 transition-all cursor-pointer shadow-sm text-[11px]"
          >
            ← Voltar ao Capítulo
          </button>
        </div>

        {/* Title Block */}
        <div className="space-y-2 text-left">
          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-150/40 py-1 px-2.5 rounded-md inline-block">
            MÓDULO DIGITAL GIPP-{mod.id.toUpperCase()}
          </span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{mod.name}</h2>
          <p className="text-xs text-slate-400 font-bold leading-relaxed">{mod.desc}</p>
        </div>

        {/* Dynamic Offline / Online Sync State Info Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-indigo-50/50 p-4.5 rounded-3xl border border-indigo-100 text-left text-xs no-print">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse block shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded">
                Manual Off-line Ativo
              </span>
            </div>
            <h4 className="text-indigo-950 font-black text-xs uppercase tracking-wide">Manual Integrado Oferece Consulta 100% Offline</h4>
            <p className="text-slate-500 font-medium text-[10px] leading-relaxed">
              Dispomos de guias completos, passos operacionais de segurança e FAQs para todos os 200+ submódulos salvos diretamente no código.
            </p>
          </div>
          <button
            onClick={() => generateAiContent(mod, true)}
            className="px-3.5 py-2 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-750 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/15 text-[11px]"
          >
            <Sparkles size={12} className="text-white animate-pulse shrink-0" />
            <span>Consultar IA (Online)</span>
          </button>
        </div>

        {/* Dynamic Loading Selector */}
        {aiLoading && (
          <div className="glass-modern border border-slate-150 rounded-[2rem] p-8 text-center space-y-6 bg-slate-50/50">
            <RefreshCw className="mx-auto text-indigo-600 animate-spin" size={40} />
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest animate-pulse">Sintetizando Manual de Instruções via IA...</h4>
              <p className="text-[10px] text-indigo-605 font-black uppercase tracking-wider">Gemini está compilando o índice e seções explicativas</p>
            </div>
            
            <div className="max-w-xs mx-auto text-left bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2.5 text-[10px] font-bold text-slate-500 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-ping" />
                <span>Analisando parâmetros de GIPP-{mod.id.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 block animate-pulse" />
                <span>Interpretando fluxos de trabalho eclesiásticos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-300 block" />
                <span>Formatando índice detalhado e seção de FAQ</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Boundary Screen */}
        {aiError && (
          <div className="bg-red-50 border border-red-150 rounded-3xl p-6 text-red-950 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-650 shrink-0 mt-0.5" size={24} />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide">Interface de IA Temporariamente Indisponível</h4>
                <p className="text-xs text-red-800 mt-1 leading-relaxed">
                  Ocorreu um erro ao consultar o servidor de inteligência artificial Gemini: <span className="font-mono">{aiError}</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-red-100 rounded-2xl p-4 space-y-2">
              <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wide">Manual Padrão Offline (Fallback)</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                Módulo GIPP-{mod.id.toUpperCase()} - {mod.name}: recurso projetado para gerenciar {mod.desc.toLowerCase()}. Use-o através do atalho correspondente para registrar ações, auditar logs e sincronizar alterações em tempo real de forma segura.
              </p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => generateAiContent(mod, true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-750 active:scale-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Tentar Consultar IA Novamente
              </button>
              <button 
                onClick={() => generateAiContent(mod, false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-slate-100 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Carregar Manual Estático Offline
              </button>
            </div>
          </div>
        )}

        {/* Content Render */}
        {aiContent && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-entrance text-left">
            {/* Embedded index / sidebar */}
            <div className="md:col-span-4 bg-slate-50 p-4.5 rounded-[1.5rem] border border-slate-200 space-y-3.5 sticky top-4 md:block hidden no-print pr-1">
              <h5 className="text-[10px] uppercase font-black tracking-widest text-slate-400">Sumário da Seção</h5>
              <div className="space-y-1">
                {aiContent.index.map((idxItem: any) => (
                  <a
                    key={idxItem.anchor}
                    href={`#ai-${idxItem.anchor}`}
                    className="block text-[11px] font-bold text-slate-500 hover:text-indigo-650 py-1.5 px-2 rounded-lg hover:bg-white transition-all transition-colors border border-transparent hover:border-slate-150"
                  >
                    {idxItem.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Main book content */}
            <div className="md:col-span-8 space-y-8">
              {aiContent.sections.map((sect: any) => {
                const isSteps = sect.anchor === 'operacao' && sect.steps;
                const isSafety = sect.anchor === 'seguranca' && sect.levelRequired;
                const isFaq = sect.anchor === 'faq' && sect.questions;
                const isTips = sect.anchor === 'sugestoes' && sect.tips;

                return (
                  <div key={sect.anchor} id={`ai-${sect.anchor}`} className="space-y-3 scroll-mt-6 text-left">
                    <h4 className="text-sm font-black text-slate-850 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 block shrink-0" />
                      {sect.title}
                    </h4>

                    {/* Standard paragraphs */}
                    {sect.content && (
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold whitespace-pre-line">
                        {sect.content}
                      </p>
                    )}

                    {/* Step by step */}
                    {isSteps && (
                      <div className="space-y-3 pt-1.5">
                        {sect.steps.map((st: string, sIdx: number) => (
                          <div key={sIdx} className="flex gap-3">
                            <div className="w-5.5 h-5.5 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center font-mono text-[10px] font-black text-white shrink-0 mt-0.5">
                              {sIdx + 1}
                            </div>
                            <p className="text-xs text-slate-600 leading-normal font-semibold">
                              {st}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Safety Levels and Governance */}
                    {isSafety && (
                      <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 flex gap-3 text-amber-950">
                        <Shield className="text-amber-600 shrink-0 mt-0.5 animate-pulse" size={18} />
                        <div>
                          <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-100/50 py-0.5 px-2 rounded-md inline-block mb-1">
                            Acesso Recomendado: {sect.levelRequired}
                          </span>
                          <p className="text-xs text-amber-800 leading-normal font-semibold">
                            {sect.content}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* FAQ Items */}
                    {isFaq && (
                      <div className="space-y-2 pt-1.5">
                        {sect.questions.map((qItem: any, qIdx: number) => {
                          const isOpen = activeFaqIndex === qIdx;
                          return (
                            <div key={qIdx} className="bg-white border border-slate-150 rounded-xl overflow-hidden shadow-sm">
                              <button
                                onClick={() => setActiveFaqIndex(isOpen ? null : qIdx)}
                                className="w-full flex items-center justify-between text-left p-3.5 bg-slate-50 hover:bg-slate-100/70 transition-colors font-bold text-[11px] text-slate-850 cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 block animate-pulse" />
                                  {qItem.q}
                                </span>
                                <span className="text-slate-400 font-normal">{isOpen ? '▲' : '▼'}</span>
                              </button>
                              {isOpen && (
                                <div className="p-4 border-t border-slate-100 bg-white text-xs text-slate-500 leading-relaxed font-semibold animate-entrance whitespace-pre-line">
                                  {qItem.a}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Bullet Tips */}
                    {isTips && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1.5">
                        {sect.tips.map((tp: string, tIdx: number) => (
                          <div key={tIdx} className="bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3 text-indigo-950 transition-all">
                            <Lightbulb className="text-indigo-600 shrink-0 mt-0.5" size={16} />
                            <p className="text-xs text-indigo-900 leading-normal font-semibold">
                              {tp}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  
  const ALL_GIPP_MODULES = useMemo(() => [
    // MEMBERS & VISITORS (membros)
    { id: 'm1', name: 'Cadastro de Membros Ativos', category: 'membros', desc: 'Ficha cadastral completa com endereço, foto, filiação e datas de batismo.' },
    { id: 'm2', name: 'Controle de Membros Inativos', category: 'membros', desc: 'Gerenciamento de membros licenciados, transferidos ou falecidos.' },
    { id: 'm3', name: 'Anexação de Foto via Câmera/Upload', category: 'membros', desc: 'Captura em tempo real para identificação visual e credenciamento.' },
    { id: 'm4', name: 'Histórico de Cargos Ministeriais', category: 'membros', desc: 'Registro temporal de promoções obreiras (Auxiliar, Diácono, Presbítero, Pastor).' },
    { id: 'm5', name: 'Status de Contribuição (Fiel/Irregular)', category: 'membros', desc: 'Indicador automático de dízimos correspondentes aos últimos 3 meses.' },
    { id: 'm6', name: 'Alertas de Aniversariantes do Mês', category: 'membros', desc: 'Filtro para envio de mensagens comemorativas automatizadas.' },
    { id: 'm7', name: 'Lembretes de Aniversário de Casamento', category: 'membros', desc: 'Aviso para comemorações pastorais e orações dedicadas aos casais.' },
    { id: 'm8', name: 'CRM de Visitantes e Consolidandos', category: 'membros', desc: 'Gestão de novos participantes com monitoramento de integração.' },
    { id: 'm9', name: 'Registro de Pedidos de Oração', category: 'membros', desc: 'Painel de petições urgentes de membros e visitantes para intercessão.' },
    { id: 'm10', name: 'Atribuição de Obreiro Consolidador', category: 'membros', desc: 'Logística de distribuição de novos contatos para acompanhamento espiritual.' },
    { id: 'm11', name: 'Ficha de Visita Telefônica / Doméstica', category: 'membros', desc: 'Registro de visitas efetuadas e observações de saúde pastoral.' },
    { id: 'm12', name: 'Relatórios Geodemográficos de Fiéis', category: 'membros', desc: 'Mapa de calor indicando regiões físicas com maior densidade de membros.' },
    { id: 'm13', name: 'Controle de Casamentos Eclesiásticos', category: 'membros', desc: 'Histórico de enlaces com certidões e pastores celebrantes.' },
    { id: 'm14', name: 'Histórico de Batismo nas Águas', category: 'membros', desc: 'Livro oficial de registros de batismos por lagos, mares ou tanques.' },
    { id: 'm15', name: 'Histórico de Profissão de Fé', category: 'membros', desc: 'Data e atos solenes de declaração de aliança pública.' },
    { id: 'm16', name: 'Histórico de Recepção por Carta', category: 'membros', desc: 'Registro de membros recebidos com carta de recomendação de filiais.' },
    { id: 'm17', name: 'Envio de Avisos via WhatsApp (Membros)', category: 'membros', desc: 'Disparo de chamados e escalas via link direto unificado.' },
    { id: 'm18', name: 'Controle de Filiação e Árvore Relacional', category: 'membros', desc: 'Identificação de laços conjugais e parentais no Rol.' },
    { id: 'm19', name: 'Anotações Confidenciais Pastorais', category: 'membros', desc: 'Anotações espirituais protegidas por níveis restritos de criptografia.' },
    { id: 'm20', name: 'Ficha de Habilidades & Voluntariado', category: 'membros', desc: 'Mapeamento de talentos (música, cozinha, design, ensino) no Rol.' },
    { id: 'm21', name: 'Exportação Completa em Excel (Rol)', category: 'membros', desc: 'Exportação instantânea de toda a base de membros em formato .csv.' },
    { id: 'm22', name: 'Filtros Dinâmicos Multi-Campos', category: 'membros', desc: 'Pesquisa avançada por cargo, idade, status, congregação e departamento.' },
    { id: 'm23', name: 'Ficha Médica de Segurança', category: 'membros', desc: 'Registro de alergias, tipagem sanguínea e contatos de emergência.' },
    { id: 'm24', name: 'Fichas de Crianças e Pré-Adolescentes', category: 'membros', desc: 'Controle de Rol Infantil vinculado aos dados dos responsáveis legais.' },
    { id: 'm25', name: 'Status de Comunhão Eclesiástica', category: 'membros', desc: 'Visualização de disciplina fraterna no cumprimento de normas estatais.' },

    // FINANCIALS & BALANCETES (financeiro)
    { id: 'f1', name: 'Lançamento de Dízimos por Membro', category: 'financeiro', desc: 'Registro nominal com associação direta à carteira de membros.' },
    { id: 'f2', name: 'Lançamento de Ofertas Gerais de Culto', category: 'financeiro', desc: 'Ofertas recolhidas voluntariamente em cultos presenciais.' },
    { id: 'f3', name: 'Doações Diretas e Ofertas Missionárias', category: 'financeiro', desc: 'Destinações específicas para o campo de missões nacionais ou estrangeiros.' },
    { id: 'f4', name: 'Lançamento de Despesas por Centro de Custo', category: 'financeiro', desc: 'Saídas categorizadas para monitoramento administrativo da sede.' },
    { id: 'f5', name: 'Demonstrativo de Resultados do Exercício (DRE)', category: 'financeiro', desc: 'Gráficos e tabelas financeiras indicando superávit ou déficit.' },
    { id: 'f6', name: 'Conciliação Bancária Avançada (OFX)', category: 'financeiro', desc: 'Upload de extratos eletrônicos e conciliação de transações automática.' },
    { id: 'f7', name: 'Gerenciamento de Carnês de Campanhas', category: 'financeiro', desc: 'Geração e controle de parcelamentos para obras e aquisições.' },
    { id: 'f8', name: 'Impressão de Recibos Avulsos', category: 'financeiro', desc: 'Emissor rápido de comprovante de dízimo ou oferta assinada.' },
    { id: 'f9', name: 'Calculadora de Dízimos Proporcional', category: 'financeiro', desc: 'Auxiliar para cálculo de dízimos voluntários com base em receitas.' },
    { id: 'f10', name: 'Controle de Saldo das Contas da Igreja', category: 'financeiro', desc: 'Monitor de saldos bancários, caixa físico e investimentos eclesiásticos.' },
    { id: 'f11', name: 'Relatório Consolidado de Filiais', category: 'financeiro', desc: 'Fechamento financeiro unificado integrando matriz e filiais regionais.' },
    { id: 'f12', name: 'Geração de Gráfico de Linha de Entradas', category: 'financeiro', desc: 'Análise de sazonalidade de captações financeiras mensais.' },
    { id: 'f13', name: 'Geração de Gráfico de Pizza de Despesas', category: 'financeiro', desc: 'Análise percentual de saídas de recursos (infraestrutura, missões).' },
    { id: 'f14', name: 'Duplicatas e Contas a Pagar', category: 'financeiro', desc: 'Lançamento futuro de contas fixas (Luz, Água, Internet, Aluguel).' },
    { id: 'f15', name: 'Relatório Multi-Moedas / Células', category: 'financeiro', desc: 'Rastreamento de moedas, dízimos e ofertas colhidos de forma descentralizada.' },
    { id: 'f16', name: 'Controle de Impostos e IPTU Imóveis', category: 'financeiro', desc: 'Registro de isenções tributárias e contribuições permitidas.' },
    { id: 'f17', name: 'Auditoria de Desvios Contábeis', category: 'financeiro', desc: 'Monitoramento de retificações e edições de tesouraria de cultos passados.' },
    { id: 'f18', name: 'Relação de Fornecedores Cadastrados', category: 'financeiro', desc: 'Cadastro de CNPJ de parceiros de construção e serviços.' },
    { id: 'f19', name: 'Painel de Metas de Arrecadação', category: 'financeiro', desc: 'Barra de progresso visual para arrecadação de novos bens (ex: som, ar).' },
    { id: 'f20', name: 'Geração de Balancete em Formato PDF', category: 'financeiro', desc: 'Layout formal de prestação de contas com assinaturas dos tesoureiros.' },
    { id: 'f21', name: 'Atribuição de Impressora de Termo-Fita', category: 'financeiro', desc: 'Conector para impressão física de dízimos em impressoras térmicas standard.' },
    { id: 'f22', name: 'Previsão Orçamentária Anualizada', category: 'financeiro', desc: 'Gestão preventiva de fluxo de caixa conforme padrão financeiro.' },
    { id: 'f23', name: 'Lançamentos de Caixa de Campanha', category: 'financeiro', desc: 'Segregação de lucros de cantinas, bazar ou jantares beneficentes.' },
    { id: 'f24', name: 'Estorno com Confirmação Master', category: 'financeiro', desc: 'Segurança absoluta em transações que impede estornos acidentais.' },
    { id: 'f25', name: 'Associação de Comprovantes Digitais', category: 'financeiro', desc: 'Armazenamento de fotos de recibos fiscais nas despesas do sistema.' },

    // CELLS & PILGRIMS (celulas)
    { id: 'c1', name: 'Cadastro de Células por Região', category: 'celulas', desc: 'Geolocalização de pontos de culto domésticos cadastrados.' },
    { id: 'c2', name: 'Atribuição de Líderes de Célula', category: 'celulas', desc: 'Nomeação de responsáveis pela condução semanal de novos discípulos.' },
    { id: 'c3', name: 'Histórico de Frequência de Membros', category: 'celulas', desc: 'Ata de presença nos lares de forma semanal digitalizada.' },
    { id: 'c4', name: 'Registro de Visitantes na Célula', category: 'celulas', desc: 'Rastreamento de novas pessoas trazidas aos encontros caseiros.' },
    { id: 'c5', name: 'Indicador de Conversão em Encontro', category: 'celulas', desc: 'Registro de decisões ao Senhor Jesus declaradas na reunião.' },
    { id: 'c6', name: 'Mapeamento de Supervisores de Distrito', category: 'celulas', desc: 'Organização em rede (Rede de Jovens, Adultos, Casais).' },
    { id: 'c7', name: 'Relatório Financeiro de Células', category: 'celulas', desc: 'Consolidação de dízimos e ofertas entregues nas reuniões domésticas.' },
    { id: 'c8', name: 'Controle de Hospedeiro / Anfitrião', category: 'celulas', desc: 'Cadastro da residência que provê o espaço físico de comunhão.' },
    { id: 'c9', name: 'Painel de Crescimento - Multiplicação', category: 'celulas', desc: 'Determinação de metas e datas de divisão de células maduras.' },
    { id: 'c10', name: 'Quadro de Testemunhos Semanais', category: 'celulas', desc: 'Histórias de cura e restaurações ministeriais ocorridas nos bairros.' },
    { id: 'c11', name: 'Roteiro de Estudos Integrado', category: 'celulas', desc: 'Disponibilidade de esboços ou folhas de estudo pastorais semanais.' },
    { id: 'c12', name: 'Controle de Lanches e Eventos da Célula', category: 'celulas', desc: 'Calendário de confraternizações e churrascos integradores.' },
    { id: 'c13', name: 'Gráfico Comparativo de Redes', category: 'celulas', desc: 'Visualização estatística de frequência global de cada distrito.' },
    { id: 'c14', name: 'Relatório de Reuniões Não Realizadas', category: 'celulas', desc: 'Justificativas de suspensões de cultos por feriados ou intempéries.' },
    { id: 'c15', name: 'Transferência de Membro entre Células', category: 'celulas', desc: 'Migração de registro cadastral sem perda do histórico de participação.' },
    { id: 'c16', name: 'Controle de Batizandos Gerados em Célula', category: 'celulas', desc: 'Vinculação dos novos cristãos da rede para o batistério principal.' },
    { id: 'c17', name: 'Filtro por Faixa Etária e Gênero', category: 'celulas', desc: 'Filtros para busca de dízimos/frequências em grupos específicos.' },
    { id: 'c18', name: 'Histórico de Liderança de Áreas', category: 'celulas', desc: 'Rastreamento temporal de líderes na gestão de pequenas redes.' },
    { id: 'c19', name: 'Geração de Crachás de Coordenadores', category: 'celulas', desc: 'Impressão de identificadores para congressos e reuniões de liderança.' },
    { id: 'c20', name: 'CRM de Acompanhamento Telefônico', category: 'celulas', desc: 'Função de disparo de chamadas para controle de absenteísmo na reunião.' },

    // SECRETARIAT & SUNDAY SCHOOL (secretaria)
    { id: 's1', name: 'Agenda Geral Multi-Eventos', category: 'secretaria', desc: 'Grade cronológica contendo ensaios, vigílias e congressos.' },
    { id: 's2', name: 'Atribuição de Escalas de Louvor/Som', category: 'secretaria', desc: 'Controle de músicos e técnicos escalados para operação de mesas.' },
    { id: 's3', name: 'Escala de Recepção / Diaconato', category: 'secretaria', desc: 'Logística de obreiros atuando em recepções e portas de templos.' },
    { id: 's4', name: 'Emissor de Carta de Recomendação', category: 'secretaria', desc: 'Documento contendo dados de filiação ativa para fins de viagem.' },
    { id: 's5', name: 'Emissor de Certificado de Batismo', category: 'secretaria', desc: 'Certidão formal e colorida contendo assinaturas dos pastores.' },
    { id: 's6', name: 'Emissor de Certificado de Apresentação', category: 'secretaria', desc: 'Documento impresso para registro de crianças apresentadas.' },
    { id: 's7', name: 'Registro de Ata de Assembleias', category: 'secretaria', desc: 'Espaço digital para arquivamento oficial de decisões tomadas em plenário.' },
    { id: 's8', name: 'Controle de Classes de Alunos EBD', category: 'secretaria', desc: 'Estruturação da Escola Bíblica Dominical (Infantil, Jovens, Adultos).' },
    { id: 's9', name: 'Chamada Eletrônica de Alunos', category: 'secretaria', desc: 'Presença e atrasos de alunos matriculados nas salas dominicais.' },
    { id: 's10', name: 'Desempenho por Lição e Revistas EBD', category: 'secretaria', desc: 'Acompanhamento pedagógico de leitura bíblica de cada classe.' },
    { id: 's11', name: 'Atribuição de Professores Graduados', category: 'secretaria', desc: 'Escala de lecionários e docentes ativos da igreja.' },
    { id: 's12', name: 'Ofício de Ofício e Separação Cooperativa', category: 'secretaria', desc: 'Ata de ordenação ministerial em eventos convencionais.' },
    { id: 's13', name: 'Estatísticas Globais de Presença Teológica', category: 'secretaria', desc: 'Percentual de membros inscritos versus presentes em sala de aula.' },
    { id: 's14', name: 'Controle de Doações de Livros e Teologia', category: 'secretaria', desc: 'Biblioteca pastoral contendo controle de empréstimos e devoluções.' },
    { id: 's15', name: 'Controle de Matrícula Teológica de Visitante', category: 'secretaria', desc: 'Visitante matriculado temporariamente na classe ebd de férias.' },
    { id: 's16', name: 'Geração de Formulário de Matrícula EBD', category: 'secretaria', desc: 'Ficha para preenchimento no início do semestre letivo.' },
    { id: 's17', name: 'Ficha de Evento Interno / Casamento', category: 'secretaria', desc: 'Reserva síncrona de templos e auditórios contendo checklist de recursos.' },
    { id: 's18', name: 'Impressão de Certificado de Membresia', category: 'secretaria', desc: 'Anotação formal contendo fotos e carimbo timbrado digital.' },
    { id: 's19', name: 'Relatórios Consolidados de Obreiros', category: 'secretaria', desc: 'Listagem de escala integrada de obreiros de todas as filiais.' },
    { id: 's20', name: 'Lembretes via WhatsApp para EBD', category: 'secretaria', desc: 'Automatização de mensagens convocando alunos na noite de Sábado.' },

    // INTEGRATED AI SERVICES (ai)
    { id: 'a1', name: 'Esboçador de Sermões Temáticos (IA)', category: 'ai', desc: 'Auxiliar teológico capaz de criar estruturas homiléticas de alto impacto.' },
    { id: 'a2', name: 'Aconselhador Pastoral Assistido', category: 'ai', desc: 'Ideias e subsídios baseados em psicologia cristã e versículos sagrados.' },
    { id: 'a3', name: 'Gerador de Mensagens e Devocionais', category: 'ai', desc: 'Confecção rápida de devocionais diários para redes sociais.' },
    { id: 'a4', name: 'Tradutor Bíblico e Contexto Hebraico/Grego', category: 'ai', desc: 'Explicações contextuais profundas de palavras bíblicas originais.' },
    { id: 'a5', name: 'Conversor Automático de Atas em PDF', category: 'ai', desc: 'Transformador de áudio transcrito em relatórios formais administrativos.' },
    { id: 'a6', name: 'Recomendação de Louvores por Mensagem', category: 'ai', desc: 'Associação inteligente de louvores que combinam com o sermão solar.' },
    { id: 'a7', name: 'Assistente Teológico Sistemático', category: 'ai', desc: 'Doutrinas sistemáticas (Eclesiologia, Soteriologia) ao seu dispor.' },
    { id: 'a8', name: 'Gerador de Perguntas para Escola Dominical', category: 'ai', desc: 'Questionários criados pela IA baseados na lição estudada.' },
    { id: 'a9', name: 'Redator de Boletins Ministeriais', category: 'ai', desc: 'Transformador de avisos rascunhados em um texto atraente e formal.' },
    { id: 'a10', name: 'Análise de Sentimentos em Reclamações', category: 'ai', desc: 'Avaliação assistida de feedbacks e canais pastorais de suporte.' },
    { id: 'a11', name: 'Orientador de Metas de Liderança', category: 'ai', desc: 'Ideias de engajamento para recuperação de membros distantes.' },
    { id: 'a12', name: 'Interpretação e Sugestão de Distritos', category: 'ai', desc: 'Análise estatística e recomendações para expansão de novos bairros.' },
    { id: 'a13', name: 'Geração de Sementes SQL Críticas', category: 'ai', desc: 'Facilitador para desenvolvedor na população rápida de modelos reais.' },
    { id: 'a14', name: 'Organizador de Ideias de Projetos', category: 'ai', desc: 'Auxiliar para estruturação de jantares, festivais e feiras de missões.' },
    { id: 'a15', name: 'Redigir Carta de Recomendação (Personalizada)', category: 'ai', desc: 'Emissor de textos elogiosos para membros valorosos migrando de filial.' },
    { id: 'a16', name: 'Gerador de Desafios Bíblicos Juvenis', category: 'ai', desc: 'Dinâmicas lúdicas para fins de entretenimento no departamento jovem.' },
    { id: 'a17', name: 'Auxiliar Homilético Integrado', category: 'ai', desc: 'Correção de ortografia e coerência em anotações de sermões pastorais.' },
    { id: 'a18', name: 'Resumidor de Reuniões de Conselho', category: 'ai', desc: 'Destaques e pontos de ação consolidados em segundos por IA.' },
    { id: 'a19', name: 'Criador de Copy para Eventos de Jovens', category: 'ai', desc: 'Chamadas persuasivas destinadas à atração de jovens de fora da igreja.' },
    { id: 'a20', name: 'Ideário Temático de Campanhas de Fé', category: 'ai', desc: 'Propostas de temas para semanas dedicadas de libertação ou cura.' },

    // ADMINISTRATIVE & SYSTEM SAFETY (seguranca)
    { id: 's_s1', name: 'Monitoramento Geral de Terminais (Logs)', category: 'seguranca', desc: 'Registro de IP de acessos e navegadores emparelhados.' },
    { id: 's_s2', name: 'Gestão de Usuários e Operadores', category: 'seguranca', desc: 'Controle de e-mails autorizados na administração geral.' },
    { id: 's_s3', name: 'Tabela Dinâmica de Permissões', category: 'seguranca', desc: 'Níveis de atribuição para restringir a tesouraria e a secretaria.' },
    { id: 's_s4', name: 'Trilha de Auditoria com Antes/Depois', category: 'seguranca', desc: 'Logs contendo deltas detalhados de dados modificados no banco.' },
    { id: 's_s5', name: 'Lixeira Inteligente (Recycle Bin)', category: 'seguranca', desc: 'Canal de retenção e resgate de cadastros excluídos acidentalmente.' },
    { id: 's_s6', name: 'Backup Completo em Arquivos JSON', category: 'seguranca', desc: 'Salva toda a base em um arquivo local em apenas um clique.' },
    { id: 's_s7', name: 'Importador de Dados de Arquivo Externo', category: 'seguranca', desc: 'Restauração rápida de todo o sistema GIPP a partir de backups.' },
    { id: 's_s8', name: 'Configuração Síncrona de Tema e Logo', category: 'seguranca', desc: 'Estilização visual e cores da congregação no menu administrativo.' },
    { id: 's_s9', name: 'Limpeza de Cache e Banco Local', category: 'seguranca', desc: 'Reseta o IndexedDB local para sincronização fresca de nuvem.' },
    { id: 's_s10', name: 'Fuso Horário e Idioma Integrado', category: 'seguranca', desc: 'Adequação do GIPP à fusos horários específicos de atuação.' },
    { id: 's_s11', name: 'Gerador de Chaves de Acesso API', category: 'seguranca', desc: 'Tokens criptográficos em casos de integrações em sites terceiros.' },
    { id: 's_s12', name: 'Configuração SSL da Sede Multi-Páginas', category: 'seguranca', desc: 'Diretiva de segurança SSL padrão de conexões de computadores.' },
    { id: 's_s13', name: 'Modo Desenvolvedor (Performance)', category: 'seguranca', desc: 'Monitor de processador local do banco de dados e sementeiras.' },
    { id: 's_s14', name: 'Verificação em Dois Etapas (2FA)', category: 'seguranca', desc: 'Configuração preventiva para evitar que invasores acessem a tesouraria.' },
    { id: 's_s15', name: 'Reset de Conta Master por Email', category: 'seguranca', desc: 'Controle de envio de redefinição imediata de senhas administrativas.' },
    { id: 's_s16', name: 'Notificações Google Firebase FCM', category: 'seguranca', desc: 'Tokenização e controle de notificações móveis de obreiros.' },
    { id: 's_s17', name: 'Controle de Propriedade Contábil', category: 'seguranca', desc: 'Permissões específicas para criação e exclusão de contas.' },
    { id: 's_s18', name: 'Assinaturas Digitais Criptografadas', category: 'seguranca', desc: 'Registros criptográficos permanentes nas tabelas de auditoria.' },
    { id: 's_s19', name: 'Histórico de Bloqueio de IPs Suspeitos', category: 'seguranca', desc: 'Monitoramento ativo de força bruta em acessos indesejados.' },
    { id: 's_s20', name: 'Recuperação de Parâmetros Originais', category: 'seguranca', desc: 'Restaurador padrão de fábrica de fontes, cores e acessos.' },
    // KIDS EXPANDED (v6.8.0)
    { id: 'k1', name: 'Check-in e Check-out Seguro - Salinha Kids', category: 'secretaria', desc: 'Controle de entrada e saída de crianças com código PIN secreto e crachás cadastrais.' },
    { id: 'k2', name: 'Painel de Relatório de Ocorrências - Salinha Kids', category: 'secretaria', desc: 'Resumo estatístico para coordenação ministerial com exportação em PDF timbrado.' },
    { id: 'k3', name: 'Notificações Ativas de Incidentes - Portal Kids', category: 'seguranca', desc: 'Disparo de alertas e som de notificações no Portal do Membro para avisar aos pais.' },
    { id: 'ebd1', name: 'Lançamento de Frequência Interativo - EBD', category: 'secretaria', desc: 'Controle de chamada dominical completo integrando registro de Bíblia, revista e ofertas.' },
    { id: 'ead1', name: 'Cursos EAD & Mentoria Acadêmica', category: 'secretaria', desc: 'Trilhas pedagógicas interativas com suporte a quizes doutrinários e certificados salvos em alta definição.' },
    { id: 'lit1', name: 'Agendamento Litúrgico & Séries de Sermões', category: 'secretaria', desc: 'Planeamento completo de rituais de cultos, cânticos congregacionais e pregações homiléticas pastorais.' }
  ], []);

  const filteredDirectory = useMemo(() => {
    return ALL_GIPP_MODULES.filter(mod => {
      const matchesSearch = mod.name.toLowerCase().includes(directorySearch.toLowerCase()) || 
                            mod.desc.toLowerCase().includes(directorySearch.toLowerCase());
      const matchesCategory = directoryFilter === 'todos' || mod.category === directoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [directorySearch, directoryFilter, ALL_GIPP_MODULES]);

  const manualData = [
    {
      id: 'introducao',
      title: '1. Visão Geral & Arquitetura Corporativa',
      shortTitle: 'Visão Geral',
      icon: BookOpen,
      category: 'Geral',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed font-semibold">
            Bem-vindo ao manual completo do **GIPP (Gestão Integrada de Portais Pastorais e Administrativos)**. 
            Esta plataforma representa o estado da arte na operação eclesiástica digitalizada. Projetada com foco
            em robustez contábil, acessibilidade de liderança e conformidade pastoral, o sistema organiza centenas de 
            ferramentas para governar congregações com segurança.
          </p>

          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-44 h-44 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
                </div>
                <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Arquitetura Unificada GIPP v4</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-850 rounded-2xl border border-shadow border-slate-700/50">
                  <h5 className="text-indigo-400 font-extrabold text-xs uppercase tracking-wider mb-1">Membros (Rol)</h5>
                  <p className="text-[10px] text-slate-400 leading-normal">Fichamentos offline-first equipados com controle de dízimos históricos, credenciais digitais de identificação.</p>
                </div>
                <div className="p-4 bg-slate-850 rounded-2xl border border-shadow border-slate-700/50">
                  <h5 className="text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-1">Finanças & Balancetes</h5>
                  <p className="text-[10px] text-slate-400 leading-normal">Caixa, conciliação OFX eletrônica, geração de DRE e balancetes contábeis assinados com alta legibilidade.</p>
                </div>
                <div className="p-4 bg-slate-850 rounded-2xl border border-shadow border-slate-700/50">
                  <h5 className="text-purple-400 font-extrabold text-xs uppercase tracking-wider mb-1">Portal do Membro</h5>
                  <p className="text-[10px] text-slate-400 leading-normal">Página responsiva móvel permitindo consultas diretas de escalas de cultos, faturas, credenciais e agenda.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
            <Lightbulb className="text-indigo-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wide">Subsídio Especial: Tecnologia Offline-First</h4>
              <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                O GIPP opera em sincronização dupla. Caso ocorra queda de conexões com a Internet em áreas rurais ou templos fechados, todos os lançamentos financeiros, agendas e presenças ficam operantes na memória segura do navegador. Ao restabelecer a rede, o sistema executa o envio sem duplicamento.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'diretorio',
      title: '2. Diretório Geral de Ferramentas (200+ Recursos)',
      shortTitle: 'Diretório 200+ Módulos',
      icon: Layers,
      category: 'Geral',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed font-semibold">
            O ecossistema GIPP organiza mais de 200 recursos e sub-módulos divididos por pastas e competências.
            Use os filtros interativos abaixo para consultar a ficha explicativa detalhada de cada utilitário e sua aplicação.
          </p>

          {/* Directory Panel */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 no-print">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold" size={14} />
                <input 
                  type="text"
                  placeholder="Pesquisar por recurso eclesiástico..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
                  value={directorySearch}
                  onChange={e => setDirectorySearch(e.target.value)}
                />
              </div>

              <select
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                value={directoryFilter}
                onChange={e => setDirectoryFilter(e.target.value)}
              >
                <option value="todos">Todos Departamentos (200+)</option>
                <option value="membros">Membros & CRM</option>
                <option value="financeiro">Finanças & Balancetes</option>
                <option value="celulas">Células & Redes</option>
                <option value="secretaria">Secretaria & EBD</option>
                <option value="ai">Serviços com IA</option>
                <option value="seguranca">Segurança & Sistema</option>
              </select>
            </div>

            {/* Render items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
              {filteredDirectory.map((mod) => (
                <div key={mod.id} className="p-3 bg-white hover:bg-indigo-50/20 border border-slate-150 rounded-xl transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-black text-slate-800 leading-tight block">{mod.name}</span>
                      <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">{mod.category}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal font-bold">{mod.desc}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-100 text-[8.5px] text-slate-400">
                    <span className="font-semibold">ID: GIPP-{mod.id.toUpperCase()}</span>
                    <button 
                      onClick={() => {
                        setSelectedSubModule(mod);
                        generateAiContent(mod);
                      }}
                      className="text-indigo-600 font-extrabold flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-none outline-none hover:bg-slate-50 py-0.5 px-1.5 rounded transition-all"
                    >
                      Gerar Manual IA <Sparkles size={10} className="text-indigo-500 animate-pulse" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredDirectory.length === 0 && (
                <div className="p-8 text-center text-slate-400 col-span-2">
                  <Info className="mx-auto mb-2 opacity-50" size={24} />
                  <p className="text-xs font-semibold">Nenhum módulo encontrado na pesquisa.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold border-t border-slate-200 pt-3">
              <span>Listando {filteredDirectory.length} recursos correspondentes</span>
              <span className="text-indigo-600 font-extrabold">200+ Sub-módulos Operantes</span>
            </div>
          </div>

          <div className="p-5 bg-indigo-50 border border-indigo-150 rounded-2xl flex gap-3 text-indigo-900">
            <Cpu className="shrink-0 mt-0.5" size={18} />
            <p className="text-xs leading-relaxed">
              Todos os sub-recursos acima utilizam a API reativa de estados do GIPP. As alterações contábeis ou cadastros em qualquer uma dessas páginas refletem dinamicamente e em frações de milissegundos nos painéis master e de visualização dos pastores.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'membros',
      title: '3. Fichamento de Membros & CRM de Visitantes',
      shortTitle: 'Membros & Visitantes',
      icon: Users,
      category: 'Módulos',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed font-semibold">
            O **Módulo de Rol de Membros** gerencia o cadastro eclesiástico formal de cada congregação. Contendo dados civis, familiares, e o histórico de dízimos do indivíduo.
          </p>

          {/* User Guide Card */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider ml-1">Como Cadastrar um Novo Membro de Forma Correta:</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-150 p-4 rounded-2xl relative shadow-sm">
                <span className="absolute -top-3 left-4 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">1</span>
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide mt-2">Dados Civis</h5>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">Insira Nome Completo, E-mail, Sexo, Estado Civil e Telefone. Evite codificações ou abreviações informais.</p>
              </div>

              <div className="bg-white border border-slate-150 p-4 rounded-2xl relative shadow-sm">
                <span className="absolute -top-3 left-4 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">2</span>
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide mt-2">Cargo & Igreja</h5>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">Defina o Cargo Eclesiástico do fiel (Auxiliar, Diácono, Presbítero, Obreiro, Pastor) e a Congregação de atuação.</p>
              </div>

              <div className="bg-white border border-slate-150 p-4 rounded-2xl relative shadow-sm">
                <span className="absolute -top-3 left-4 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">3</span>
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide mt-2">Avatar & Biometria</h5>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">Use o botão de câmera integrada para capturar o retrato oficial destinado às carteirinhas e de credenciamento em lote.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Ficha de Membro Ilustrada</span>
              <span className="text-[9px] text-slate-400 font-bold">Modelo GIPP Sede</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                AF
              </div>
              <div className="space-y-1 text-center sm:text-left select-none">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">André de Figueiredo Souza</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cargo: Evangelista | Matriz Porto Alegre</p>
                <div className="flex gap-2 justify-center sm:justify-start mt-1">
                  <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold uppercase">Rol Ativo</span>
                  <span className="text-[8px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase">Dizimista Fiel</span>
                  <span className="text-[8px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-bold uppercase">Classe EBD: Líderes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">Subsídio de Integração de Visitantes (CRM)</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Não encare visitantes apenas como cadastrais. O GIPP possui um **pipeline de consolidação** dedicado. Para cada visitante, registre o pedido de oração especial no topo e delegue para uma das redes de intercessão acompanhar. O obreiro receberá um lembrete no celular para telefonar no prazo de 48 horas.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'financeiro',
      title: '4. Finanças: Fluxo, DRE & Conciliação Bancária',
      shortTitle: 'Finanças & Conciliação',
      icon: Wallet,
      category: 'Módulos',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed font-semibold">
            O **Módulo Financeiro** opera sob rigorosas regras contábeis comerciais. Unindo conciliação automatizada por arquivos extrato (OFX) com gráficos de indicadores de retenção de dízimos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-slate-150 rounded-2xl space-y-2 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1"><CheckCircle className="text-emerald-500" size={14} /> Lançamento de Receitas</h4>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Dízimos nominais vinculantes aos obreiros, ofertas gerais de cultos domésticos ou presenciais, carnes de campanhas para reformas e dízimos recolhidos por distritos.</p>
            </div>
            
            <div className="p-5 bg-white border border-slate-150 rounded-2xl space-y-2 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1"><AlertTriangle className="text-rose-500" size={14} /> Centro de Custo de Despesas</h4>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Classificação formal de saídas contábeis por categoria (Infraestrutura, Missões, Proventos Pastorais, Aluguel, Água e Energia).</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl relative overflow-hidden space-y-4">
            <h4 className="text-sm font-black tracking-tight uppercase text-indigo-300">Como Efetuar a Conciliação Bancária OFX:</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-light">
              A conciliação bancária reduz o tempo operacional da tesouraria em até 85%. Em vez de cadastrar lançamentos repetitivos de tarifas e taxas bancárias à mão:
            </p>
            
            <ol className="text-xs text-white space-y-1.5 font-bold list-decimal list-inside pl-1 bg-slate-850 p-4 rounded-xl border border-slate-800">
              <li>Acesse o menu **Financeiro** &gt; Aba **Conciliação Bancária** (Aba 8).</li>
              <li>Faça download do arquivo de Extrato de Conta no formato **OFX** no Internet Banking de sua instituição.</li>
              <li>Importe o arquivo no campo de Upload do painel GIPP.</li>
              <li>O sistema cruza lançamentos idênticos e propõe novos cadastros automáticos de tarifas residuais.</li>
            </ol>
          </div>

          <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 flex gap-3">
            <Lightbulb className="text-indigo-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wide">DRE & Transparência Ministerial</h4>
              <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                Utilize a sub-seccional de **Relatório DRE** para verificar o fluxo líquido anualizado da igreja. Ele compila o faturamento agregando as receitas ministeriais deduzidas das amortizações estruturadas para facilitar auditorias anuais de conselhos fiscais.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'celulas',
      title: '5. Células e Redes Geográficas',
      shortTitle: 'Células & Redes',
      icon: MapPin,
      category: 'Módulos',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed font-semibold">
            As células ou pequenos grupos domésticos são células vitais no crescimento sadio da igreja. O GIPP possui um hub completo para registro de encontros, frequência nominal de frequentadores e relatórios de ofertas.
          </p>

          <div className="bg-indigo-950 text-indigo-100 p-6 rounded-3xl space-y-4">
            <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5"><Layers size={14} /> Cadeia de Supervisão Hierárquica</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-indigo-900 border border-indigo-850 rounded-xl">
                <span className="text-[9px] font-bold text-indigo-350 uppercase block">Supervisor de Rede</span>
                <p className="text-xs font-extrabold text-white mt-1">Supervisão de Área</p>
              </div>

              <div className="p-3 bg-indigo-900 border border-indigo-850 rounded-xl">
                <span className="text-[9px] font-bold text-indigo-350 uppercase block">Líderes de Célula</span>
                <p className="text-xs font-extrabold text-white mt-1">Controle de Reunião</p>
              </div>

              <div className="p-3 bg-indigo-900 border border-indigo-850 rounded-xl">
                <span className="text-[9px] font-bold text-indigo-350 uppercase block">Anfitrião Leste</span>
                <p className="text-xs font-extrabold text-white mt-1">Sedes Residenciais</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider ml-1">Frequência e Sincronismo Semanal:</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ao término de cada reunião nas quintas ou sextas-feiras, o Líder realiza a chamada via dispositivo celular de forma imediata. O relatório gera contagem de dízimos nominais ou ofertas de células que serão validados na tesouraria de Sábado pelo Tesoureiro Unificado para integridade fiscal.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex gap-3 text-emerald-950">
            <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide">Fórmula de Multiplicação de Célula</h4>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                O sistema de crescimento alerta o supervisor de área quando o limite máximo recomendado de participantes de uma reunião caseira (15 pessoas) for excedido por mais de 3 semanas consecutivas, instigando o planejamento de multiplicação ministerial.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'secretaria',
      title: '6. Secretaria, EBD e Agendas Síncronas',
      shortTitle: 'Secretaria & EBD',
      icon: Calendar,
      category: 'Módulos',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed font-semibold">
            Evite conflitos de agendas de cultos e ensaios ministeriais. Consolidando eventos, classes da Escola Bíblica Dominical, notas de andamento de salas teológicas e registros de atas em um só lugar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 py-0.5 px-2 rounded-md inline-block">Módulo EBD</span>
              <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">Classes e Estágios Teológicos</h5>
              <p className="text-[10px] text-slate-400 font-bold leading-normal">Cadastre lições bíblicas, presença bimestral de alunos das filiais, atribua professores titulados e confira o percentual acumulado de engajamento doutrinário da congregação.</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 py-0.5 px-2 rounded-md inline-block">Agenda Central</span>
              <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">Espaço Multi-Templos</h5>
              <p className="text-[10px] text-slate-400 font-bold leading-normal">Unifique reservas e agendas de auditórios, templos, batistérios de filiais de forma síncrona, evitando reuniões conflitantes de departamentos diversos na congregação.</p>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 flex gap-3 text-indigo-900">
            <Lightbulb className="text-indigo-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide">Recurso de Envio Rápidos WhatsApp</h4>
              <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                Na tela de Escalas da Secretaria, selecione a equipe pastoral encarregada, clique no botão "WhatsApp Lembrete" no cabeçalho. O sistema sintetiza uma convocação visual detalhada contendo horários e tarefas que pode ser remetida de forma automatizada ao obreiro selecionado.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai',
      title: '7. Assistente de Inteligência Artificial GIPP',
      shortTitle: 'Assistente AI',
      icon: Sparkles,
      category: 'Módulos',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed font-semibold">
            O GIPP integra as inteligências artificiais inovadoras do ecossistema Google Gemini para acelerar a confecção de materiais de ensino ministerial de alta qualidade e relatórios gerenciais estruturados.
          </p>

          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 translate-y-12 opacity-5">
              <Sparkles size={180} />
            </div>

            <div className="relative z-10 space-y-4">
              <h4 className="text-xs font-mono tracking-widest text-indigo-400 uppercase">Inteligência Conversacional Teológica</h4>
              <h3 className="text-lg font-black tracking-tight leading-snug">Como se Beneficiar do Assistente AI GIPP</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-bold">
                Localizada no atalho rápido <kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono">Alt + A</kbd> do teclado, o assistente fornece soluções imediatas de auxílio à gestão da congregação:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase">1. Esboços Homiléticos</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Insira temas (ex: Retidão ou Generosidade) para obter esboços estruturados de cultos teológicos contendo introdução, versículos e ilustrações.</p>
                </div>

                <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase">2. Aconselhamento de Suporte</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Consulte subsídios éticos e baseados na psicologia cristã pastoral para aconselhar famílias em momentos difíceis.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 flex gap-3 text-indigo-950">
            <Info className="text-indigo-600 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide">Uso e Segurança Ética de Dados</h4>
              <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                Todas as consultas feitas no Assistente AI GIPP são unificadas e interpretadas estritamente de forma server-side protegida. Nenhum dado de sua igreja ou informações confidenciais de membros dízimos são compartilhadas no treinamento público de redes externas de inteligência artificial.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'credenciais',
      title: '8. Carteirinhas de Membros, Credenciamento & Patrimônio',
      shortTitle: 'Carteirinhas & Patrimônio',
      icon: Award,
      category: 'Módulos',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed font-semibold">
            O **Controle de Carteirinhas** e inventário patrimonial garante a legitimidade dos bens físicos de sua congregação e a padronização profissional da apresentação ministerial de seus obreiros graduados.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-2">
              <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wide flex items-center gap-1"><Printer size={14} className="text-indigo-600" /> Designer de Carteirinhas de Membros</h4>
              <p className="text-[10px] text-slate-400 font-bold leading-normal">
                Gere carteiras individuais ou credenciais ministeriais de diaconato, presbitério e pastorado no padrão convencional de PVC. O sistema anexa fotos de biometria e QRCode unificado validável na tela do Portal do Membro.
              </p>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-2">
              <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1"><Layers size={14} className="text-emerald-600" /> Inventário de Patrimônio de Bens</h4>
              <p className="text-[10px] text-slate-500 leading-normal font-bold">
                Cadastre todo o acervo instrumental e de sonorização de sua congregação. Insira localizadores de sala, depreciação acumulada ao ano e gere termos de comodato assinados para evitar desvios patrimoniais de bens.
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 flex gap-3 text-indigo-950">
            <BookOpen className="text-indigo-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide">Como Efetuar Emissão de Credenciais em Lote</h4>
              <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                Na barra superior de Controle de Credenciamento, selecione os obreiros desejados usando a caixa de seleção de dízimos. Clique em "Imprimir em Lote (PDF)" para exportar um layout grade A4 unificado, pronto para laminação e uso profissional imediato em convenções.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'seguranca',
      title: '9. Controle de Acesso, Auditoria de Auditoria & Backup',
      shortTitle: 'Segurança & Auditoria',
      icon: Shield,
      category: 'Segurança',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed font-semibold">
            O GIPP opera sob severas medidas de sigilo e integridade estrutural contábil. Contendo trilhas de auditoria pontuais de alteração e lixeiras virtuais dedicadas ao resgate inteligente instantâneo de lançamentos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Nível Master (Pastores)</span>
              <p className="text-[10px] text-slate-500 leading-snug font-bold">Acesso total irrestrito para parametrização do faturamento e restauração de dados críticos de filiais.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Nível Secretaria</span>
              <p className="text-[10px] text-slate-500 leading-snug font-bold">Atribuível ao cadastro de fiéis em Rol de Membro, CRM de Visitantes e controle pedagógico da Escola EBD.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Seccional Tesouraria</span>
              <p className="text-[10px] text-slate-500 leading-snug font-bold">Competências limitadas estritamente ao controle de lançamentos, fechamentos e conciliação bancária.</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-950">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide">Trilha de Auditoria com Deltas Detalhados</h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Cada salvamento do Rol de Memembros ou faturas do faturamento gera um log automático na aba **Auditoria**. A tabela armazena a alteração feita na base relatando o id do operador, data, hora, e o delta do registro antes e depois da edição para controle inquebrável.
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 flex gap-3 text-indigo-950">
            <Lightbulb className="text-indigo-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide">Lixeira Virtual & Importações JSON de Emergência</h4>
              <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                Excluiu um membro importante do Rol por engano? Não se desespere. O GIPP possui a aba **Lixeira Inteligente**. Cadastros apagados permanecem lá por até 90 dias e podem ser restaurados ao Rol Ativo em 1 clique sem perdas de dízimos históricos. Realize backups recorrentes salvando o arquivo JSON em cartões de memória.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: '10. Central de Ajuda & Dúvidas Frequentes',
      shortTitle: 'Dúvidas & FAQs',
      icon: HelpCircle,
      category: 'Suporte',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed font-semibold">
            Reunimos abaixo as resoluções técnicas de problemas comuns documentados nos canais corporativos de engenharia GIPP.
          </p>

          <div className="space-y-4">
            <div className="bg-white border border-slate-150 p-4 rounded-2xl space-y-1.5 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 block shrink-0" />
                Como redefinir a senha de acesso ao Portal dos Membros?
              </h4>
              <p className="text-xs text-slate-450 leading-relaxed font-bold">
                Acesse o menu **Acessos do Portal** como administrador Master. Localize o membro, clique em "Resetar Credencial". O sistema redefinirá a senha padrão associada ao CPF ou código do indivíduo no Portal.
              </p>
            </div>

            <div className="bg-white border border-slate-150 p-4 rounded-2xl space-y-1.5 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 block shrink-0" />
                Não recebo notificações de dispositivo celular GIPP?
              </h4>
              <p className="text-xs text-slate-450 leading-relaxed font-bold">
                Ao abrir o sistema em seu smartphone de preferência, verifique se concedeu a autorização física de notificações em "Configurações do Google" de seu aparelho ou resete o Token móvel nas configurações do app.
              </p>
            </div>

            <div className="bg-white border border-slate-150 p-4 rounded-2xl space-y-1.5 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 block shrink-0" />
                Dizimistas irregulares na listagem nominal do Rol?
              </h4>
              <p className="text-xs text-slate-450 leading-relaxed font-bold">
                O GIPP categoriza dizimistas de acordo com dízimos do faturamento registrados nominalmente e síncronos nos últimos 3 meses correspondentes. Caso haja pendências de digitação pelo Tesoureiro, a tag sofrerá decréscimo.
              </p>
            </div>
          </div>

          <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group select-none">
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5">
              <BookOpen size={200} />
            </div>
            <div className="relative z-10 space-y-3">
              <h4 className="text-sm font-black tracking-tight flex items-center gap-1.5"><Star size={16} className="text-amber-300" /> Precisa de Suporte Corporativo Customizado?</h4>
              <p className="text-xs text-indigo-100 leading-relaxed max-w-xl font-medium">
                Toda a equipe de infraestrutura e engenheiros GIPP está às ordens do seu ministério para garantir treinamento local e migrações tranquilas de suas bases antigas:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2 text-xs font-bold text-indigo-150">
                <a href="https://gipp-site.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline">
                  Website Oficial: gipp-site.vercel.app
                </a>
                <span className="hidden sm:inline">|</span>
                <span className="flex items-center gap-1.5">
                  <Mail size={14} />
                  patrickrodack@gmail.com
                </span>
                <span className="hidden sm:inline">|</span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} />
                  +55 (80) 9999-9999 (Suporte)
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'recursos_expandidos',
      title: '11. Recursos Expandidos: Kids, EBD, EAD, Liturgias & Missões',
      shortTitle: 'Recursos Expandidos',
      icon: Plus,
      category: 'Secretaria',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed font-semibold font-sans">
            O GIPP v6.8.0 estende as fronteiras da governança com subsistemas focados na preservação de herança das crianças (Salinha Kids), no ensino de qualidade (EBD dominical e cursos teológicos EAD) e na ministração estruturada e litúrgica de ordem pastoral.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1">
                <Baby size={16} className="text-rose-500" /> Salinha Kids & Notificações
              </span>
              <p className="text-[10px] text-slate-500 leading-snug font-bold">
                Controle de entrada e saída por PIN secreto de responsáveis legais. Emissão de alertas de incidentes urgentes via Portal do Membro para garantir total transparência junto aos familiares.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1">
                <GraduationCap size={16} className="text-indigo-500" /> EBD Interativa & EAD
              </span>
              <p className="text-[10px] text-slate-500 leading-snug font-bold">
                Mapeamento de chamadas de classes, estudos dirigidos com inteligência artificial via Gemini e cursos interativos em EAD com lições de Defesa da Fé e certificados de alta resolução.
              </p>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-rose-950">
            <Baby className="text-rose-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide">Salinha Kids: Controle de Segurança & Relatórios</h4>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                As ocorrências registradas pela liderança de Salinha Kids são sincronizadas imediatamente com a coordenação geral. O coordenador pode emitir e exportar Relatórios de Ocorrências Diários ou Semanais em PDF para subsidiar as reuniões periódicas da denominação.
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 flex gap-3 text-indigo-950">
            <GraduationCap className="text-indigo-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide">Acompanhamento e Mentoria EAD de Capacitação</h4>
              <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                Idealizado para a formação sólida de obreiros locais. Siga os módulos pedagógicos estruturados e realize os quizes de fixação teológica compostos por perguntas desafiadoras sobre a doutrina e apologética. Ao atingir a média de aproveitamento ideal, o certificado HD é confeccionado em tempo de execução.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery) return manualData;
    const query = searchQuery.toLowerCase().trim();
    return manualData.filter(sec => {
      const matchTitle = sec.title.toLowerCase().includes(query);
      const matchShortTitle = sec.shortTitle.toLowerCase().includes(query);
      return matchTitle || matchShortTitle;
    });
  }, [searchQuery, manualData]);

  const activeContent = useMemo(() => {
    return manualData.find(sec => sec.id === activeSection) || manualData[0];
  }, [activeSection, manualData]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadActiveMaterialPdf = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      let filename = '';

      if (selectedSubModule) {
        // Individual Sub-Module Manual
        const mod = selectedSubModule;
        filename = `gipp_manual_${mod.id.toLowerCase()}.pdf`;

        const info = aiContent || getOfflineDetailedManualFor(mod);

        // Header Banner
        doc.setFillColor(79, 70, 229); // indigo-600
        doc.rect(40, 40, 515, 60, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text(`MANUAL OFICIAL GIPP - GIPP-${mod.id.toUpperCase()}`, 60, 75);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(224, 231, 255); // indigo-100
        doc.text(`Mapeamento de Processo • Emitido em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 60, 90);

        // Subtitle Panel
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.rect(40, 115, 515, 45, 'F');
        doc.rect(40, 115, 515, 45, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(mod.name.toUpperCase(), 50, 132);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const wrappedDesc = doc.splitTextToSize(mod.desc, 495);
        doc.text(wrappedDesc, 50, 147);

        let y = 185 + (wrappedDesc.length * 10);

        const sectionsToProcess = info.sections || [];
        sectionsToProcess.forEach((sect: any) => {
          const isSteps = sect.anchor === 'operacao' && sect.steps;
          const isSafety = sect.anchor === 'seguranca' && sect.levelRequired;
          const isFaq = sect.anchor === 'faq' && sect.questions;
          const isTips = sect.anchor === 'sugestoes' && sect.tips;

          if (y > 720) {
            doc.addPage();
            doc.setFillColor(79, 70, 229);
            doc.rect(40, 40, 515, 8, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            doc.text(`MANUAL GIPP-${mod.id.toUpperCase()} - PÁG. ${doc.getNumberOfPages()}`, 40, 32);
            y = 65;
          }

          // Section Title
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10.5);
          doc.setTextColor(15, 23, 42); // slate-900
          doc.text(sect.title.toUpperCase(), 40, y);
          doc.setDrawColor(226, 232, 240);
          doc.line(40, y + 4, 555, y + 4);
          y += 18;

          // Section Content
          if (sect.content && !isSafety) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(71, 85, 105);
            const contentLines = doc.splitTextToSize(sect.content, 515);
            doc.text(contentLines, 40, y);
            y += (contentLines.length * 13) + 10;
          }

          // Operation steps list
          if (isSteps && sect.steps) {
            sect.steps.forEach((st: string, sIdx: number) => {
              if (y > 740) {
                doc.addPage();
                doc.setFillColor(79, 70, 229);
                doc.rect(40, 40, 515, 8, 'F');
                y = 65;
              }
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(9);
              doc.setTextColor(79, 70, 229);
              doc.text(`Passo ${sIdx + 1}:`, 40, y);
              
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(9);
              doc.setTextColor(71, 85, 105);
              const txtLines = doc.splitTextToSize(st, 460);
              doc.text(txtLines, 90, y);
              y += (txtLines.length * 13) + 8;
            });
            y += 5;
          }

          // Safety / Governance
          if (isSafety) {
            if (y > 720) {
              doc.addPage();
              doc.setFillColor(79, 70, 229);
              doc.rect(40, 40, 515, 8, 'F');
              y = 65;
            }
            // Draw an amber callout box
            doc.setFillColor(254, 243, 199); // amber-100
            doc.setDrawColor(252, 211, 77); // amber-300
            
            const boxContent = `Acesso Recomendado: ${sect.levelRequired}\n\n${sect.content}`;
            const boxLines = doc.splitTextToSize(boxContent, 485);
            const boxHeight = (boxLines.length * 13) + 16;
            
            doc.rect(40, y, 515, boxHeight, 'F');
            doc.rect(40, y, 515, boxHeight, 'S');
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(146, 64, 14); // amber-800
            doc.text(boxLines, 50, y + 14);
            
            y += boxHeight + 15;
          }

          // FAQs
          if (isFaq && sect.questions) {
            sect.questions.forEach((qItem: any) => {
              if (y > 720) {
                doc.addPage();
                doc.setFillColor(79, 70, 229);
                doc.rect(40, 40, 515, 8, 'F');
                y = 65;
              }
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(9);
              doc.setTextColor(30, 41, 59);
              doc.text(`P: ${qItem.q}`, 40, y);
              y += 13;

              doc.setFont('helvetica', 'normal');
              doc.setFontSize(9);
              doc.setTextColor(100, 116, 139);
              const ansLines = doc.splitTextToSize(`R: ${qItem.a}`, 515);
              doc.text(ansLines, 40, y);
              y += (ansLines.length * 13) + 10;
            });
            y += 5;
          }

          // Bullet Tips
          if (isTips && sect.tips) {
            sect.tips.forEach((tp: string) => {
              if (y > 740) {
                doc.addPage();
                doc.setFillColor(79, 70, 229);
                doc.rect(40, 40, 515, 8, 'F');
                y = 65;
              }
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(9);
              doc.text("• Conselho de Excelência:", 40, y);

              doc.setFont('helvetica', 'normal');
              doc.setFontSize(9);
              doc.setTextColor(71, 85, 105);
              const tipLines = doc.splitTextToSize(tp, 380);
              doc.text(tipLines, 175, y);
              y += (tipLines.length * 13) + 8;
            });
            y += 10;
          }

          y += 10;
        });

        // Add a footer line at the end
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text('MANUAL COMPILADO EM ALTA RESOLUÇÃO AUTOMATICAMENTE VIA GOVERNANÇA GIPP® PLATFORM', 40, 805);

        doc.save(filename);
      } else {
        // Full Chapter Manual Group
        handleExportPdf([activeContent], ALL_GIPP_MODULES);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao exportar o PDF do material em modo leitura.');
    }
  };

  const renderEbookLayout = () => {
    return (
      <div className="space-y-12 max-w-4xl mx-auto text-left relative animate-entrance">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background-color: white !important;
              color: #000000 !important;
            }
            .no-print {
              display: none !important;
            }
            .print-page-break {
              page-break-after: always !important;
              break-after: page !important;
            }
            .print-padding-reset {
              padding: 0 !important;
              margin: 0 !important;
            }
            h1, h2, h3, h4, h5, h6 {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        `}} />

        {/* E-book Cover Page */}
        <div className="relative overflow-hidden p-12 md:p-16 rounded-[3rem] shadow-2xl bg-slate-900 text-white min-h-[700px] flex flex-col justify-between print-page-break print-padding-reset border border-slate-800">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-10 bottom-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 my-auto relative z-10">
            <span className="text-[11px] uppercase font-mono tracking-[0.3em] bg-indigo-500/20 px-4 py-2 rounded-full inline-block backdrop-blur-sm border border-indigo-500/30 text-indigo-300 font-extrabold">
              SUÍTE DE GOVERNANÇA CORPORATIVA GIPP
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight pt-2">
              Manual de Governança <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">Eclesiástica & Sistemas GIPP</span>
            </h1>
            <div className="h-1.5 w-24 bg-indigo-500 rounded-full" />
            <p className="text-sm md:text-base text-slate-300 max-w-2xl font-light leading-relaxed">
              O e-book definitivo de operação offline-first, faturamento de tesouraria, controle patrimonial, gestão de classes EBD, CRM e relatórios ministeriais baseados em inteligência artificial.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-slate-400 font-semibold font-mono relative z-10">
            <div>
              <p className="font-extrabold text-slate-300">CORPORAÇÃO GIPP SAAS</p>
              <p>patrickrodack@gmail.com</p>
            </div>
            <div className="text-left sm:text-right">
              <p>Compilado com êxito</p>
              <p>Data: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Sumário */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-150 shadow-sm print-page-break">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
            <Layers size={22} className="text-indigo-600" />
            Sumário Técnico do Manual GIPP
          </h2>
          <p className="text-xs text-slate-400 font-semibold mb-8 leading-normal">
            Siga o sumário para navegar de forma offline ou clique para rolar diretamente até o capítulo pretendido na tela.
          </p>
          <div className="space-y-3.5">
            {manualData.map((sec, idx) => (
              <a 
                href={`#chap_${sec.id}`}
                key={sec.id}
                className="flex items-center justify-between p-3.5 hover:bg-slate-50 border border-slate-100 rounded-2xl group transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-xs font-black font-mono text-indigo-500 w-6">{(idx + 1).toString().padStart(2, '0')}.</span>
                  <span className="text-xs font-extrabold text-slate-700 group-hover:text-indigo-600 transition-colors">{sec.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <span className="uppercase tracking-wider">Capítulo {sec.category}</span>
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Chapters */}
        {manualData.map((sec, idx) => {
          // get matching sub-modules for category expansion
          let submods = [];
          if (sec.id === 'credenciais') {
            submods = ALL_GIPP_MODULES.filter(m => 
              ['m18', 'm20', 'f21', 'c19', 's4', 's5', 's16', 's18', 's19', 's_s8'].includes(m.id) ||
              m.name.toLowerCase().includes('carteir') || 
              m.name.toLowerCase().includes('credenci') || 
              m.name.toLowerCase().includes('patrim')
            );
          } else if (sec.id === 'faq') {
            submods = [];
          } else if (sec.id === 'recursos_expandidos') {
            submods = ALL_GIPP_MODULES.filter(m => ['k1', 'k2', 'k3', 'ebd1', 'ead1', 'lit1'].includes(m.id));
          } else {
            submods = ALL_GIPP_MODULES.filter(m => m.category === sec.id);
          }

          return (
            <div 
              id={`chap_${sec.id}`}
              key={sec.id}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-150 shadow-sm space-y-8 print-page-break relative text-left"
            >
              {/* Floating ID badge */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider bg-indigo-50 py-1.5 px-3.5 rounded-full inline-block">
                    Capítulo {(idx + 1).toString().padStart(2, '0')} — {sec.category.toUpperCase()}
                  </span>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-3">
                    {sec.title}
                  </h2>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl text-slate-400">
                  <sec.icon size={22} className="text-indigo-600" />
                </div>
              </div>

              {/* General introductory text from sec.content */}
              <div className="text-xs text-slate-600 font-semibold leading-relaxed space-y-4">
                {sec.content}
              </div>

              {/* Sub-modules expanded list */}
              {submods.length > 0 && (
                <div className="space-y-8 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Layers size={14} className="text-indigo-600" />
                    Guias Operacionais de Sub-módulos ({submods.length} Recursos)
                  </h3>

                  <div className="space-y-6">
                    {submods.map((sm) => {
                      const details = getOfflineDetailedManualFor(sm);
                      
                      return (
                        <div 
                          key={sm.id} 
                          className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60 space-y-5 text-left"
                        >
                          {/* Submod Header */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <span className="text-[9px] font-black font-mono text-indigo-600 uppercase tracking-wider block">GIPP-{sm.id.toUpperCase()}</span>
                              <h4 className="text-sm font-black text-slate-800 leading-tight">{sm.name}</h4>
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-150/80 px-2 py-0.5 rounded">
                              Disponível Offline
                            </span>
                          </div>

                          <p className="text-[11.5px] text-slate-500 font-bold leading-normal">{sm.desc}</p>

                          {/* Dynamic detailed sections */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold pt-2 border-t border-slate-100">
                            {/* Step By Step */}
                            {details.sections.find((s: any) => s.anchor === 'operacao') && (
                              <div className="space-y-2">
                                <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Passo a Passo de Operação</h5>
                                <ul className="space-y-1.5 pl-4 list-decimal text-[11px] text-slate-500 leading-normal">
                                  {details.sections.find((s: any) => s.anchor === 'operacao')?.steps?.map((step: string, sIdx: number) => (
                                    <li key={sIdx}>{step}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Security Role */}
                            {details.sections.find((s: any) => s.anchor === 'seguranca') && (
                              <div className="space-y-2 bg-white/70 p-3.5 rounded-xl border border-slate-150">
                                <h5 className="text-[10px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1">
                                  <Shield size={11} className="text-amber-500" /> Compliance & Governança
                                </h5>
                                <p className="text-[10.5px] font-black text-slate-700 font-mono">Cargo: {details.sections.find((s: any) => s.anchor === 'seguranca')?.levelRequired}</p>
                                <p className="text-[10.5px] text-slate-400 leading-relaxed font-bold">{details.sections.find((s: any) => s.anchor === 'seguranca')?.content}</p>
                              </div>
                            )}
                          </div>

                          {/* FAQs if present */}
                          {details.sections.find((s: any) => s.anchor === 'faq')?.questions && (
                            <div className="pt-2.5 border-t border-slate-100/65 space-y-2">
                              <h5 className="text-[10px] font-black text-indigo-950 uppercase tracking-wider">Dúvidas Práticas e Respostas</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10.5px]">
                                {details.sections.find((s: any) => s.anchor === 'faq')?.questions?.map((item: any, fIdx: number) => (
                                  <div key={fIdx} className="bg-indigo-50/20 p-2.5 rounded-lg border border-indigo-100/60 leading-normal">
                                    <p className="font-extrabold text-indigo-900">P: {item.q}</p>
                                    <p className="text-slate-500 font-bold mt-1">R: {item.a}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tips & Recommendations */}
                          {details.sections.find((s: any) => s.anchor === 'sugestoes')?.tips && (
                            <div className="text-[10.5px] font-bold text-slate-400/90 italic flex items-start gap-1.5 pt-1">
                              <Sparkles size={11} className="text-amber-500 bg-amber-50 rounded p-[1px] shrink-0 inline-block mt-0.5" />
                              <span>Excelência: {details.sections.find((s: any) => s.anchor === 'sugestoes')?.tips?.[0]}</span>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden p-8 md:p-10 rounded-[2.5rem] shadow-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white select-none">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 bottom-0 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] bg-white/10 px-3.5 py-1.5 rounded-full inline-block backdrop-blur-sm border border-white/5 text-indigo-300 font-extrabold text-xs">Suíte de Apoio Administrativo</span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none mt-2 flex items-center gap-2">
              <BookOpen className="text-indigo-400 shrink-0" size={36} />
              Manual do Usuário GIPP
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-light">
              Bem-vindo ao centro unificado de governança, documentação sistêmica de mais de 200 subsistemas corporativos e manuais corporativos do GIPP.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2.5 no-print">
            <button 
              onClick={() => setIsEbookMode(!isEbookMode)}
              className={`flex items-center gap-1.5 px-4.5 py-2.5 active:scale-95 text-xs font-black rounded-2xl tracking-wide border transition-all shadow-md cursor-pointer ${
                isEbookMode 
                  ? 'bg-amber-500 border-amber-600 text-slate-900 hover:bg-amber-400' 
                  : 'bg-white/10 border-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Layers size={13} />
              {isEbookMode ? 'Modo Leitura Direta' : 'Modo E-Book Completo'}
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-bold rounded-2xl tracking-wide border border-white/10 transition-all shadow-lg backdrop-blur-sm cursor-pointer"
            >
              <Printer size={13} />
              {isEbookMode ? 'Imprimir E-Book' : 'Imprimir Geral (PDF)'}
            </button>
            <button 
              onClick={() => handleExportPdf(manualData, ALL_GIPP_MODULES)}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-2xl tracking-wide border border-white/10 transition-all shadow-lg cursor-pointer"
            >
              <Download size={13} />
              Exportar E-Book PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      {isEbookMode ? renderEbookLayout() : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Table of Contents and Search Bar */}
        <div className="lg:col-span-4 space-y-6 no-print">
          {/* Search Box */}
          <div className="glass-modern p-4 rounded-3xl border border-white/60 space-y-3 shadow-md shadow-indigo-500/[0.02] bg-white">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pesquisar Tópicos</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Ex. OFX, credencias, dízimo, EBD..." 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl text-xs font-semibold text-slate-705 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Interactive Index */}
          <div className="glass-modern p-5 rounded-[2rem] border border-white/60 space-y-4 bg-white">
            <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest ml-1 flex items-center gap-1">Sumário dos Capítulos</h3>
            
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredSections.map(sec => {
                const ItemIcon = sec.icon;
                const isSelected = sec.id === activeSection;
                return (
                  <button
                    key={sec.id}
                    onClick={() => { setActiveSection(sec.id); setSelectedSubModule(null); }}
                    className={`w-full flex items-center justify-between text-left p-3 rounded-2xl transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.01]' 
                        : 'bg-white hover:bg-indigo-50/50 text-slate-600 hover:text-indigo-600 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
                        <ItemIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black truncate leading-tight">{sec.shortTitle}</p>
                        <span className={`text-[9.5px] font-bold block ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{sec.category}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className={`opacity-80 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
              {filteredSections.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <HelpCircle className="mx-auto mb-2 opacity-50" size={32} />
                  <p className="text-xs font-semibold">Nenhum termo encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content viewer */}
        <div className="lg:col-span-8 glass-modern p-6 sm:p-10 rounded-[2.5rem] border border-white/60 space-y-6 shadow-sm min-h-[500px] bg-white">
          <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider bg-indigo-50 py-1.5 px-3.5 rounded-full inline-block">
                {selectedSubModule ? 'Assessoria IA GIPP' : `Seção ${activeContent.category}`}
              </span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-2 flex items-center gap-2">
                {selectedSubModule ? (
                  <>
                    <Sparkles size={24} className="text-indigo-600 animate-pulse" />
                    Módulo GIPP-{selectedSubModule.id.toUpperCase()}
                  </>
                ) : (
                  <>
                    <activeContent.icon size={24} className="text-indigo-600" />
                    {activeContent.title}
                  </>
                )}
              </h2>
            </div>

            <button
              onClick={handleDownloadActiveMaterialPdf}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-2xl tracking-wide transition-all shadow-md cursor-pointer shrink-0 no-print"
            >
              <Download size={13} />
              {selectedSubModule ? 'Baixar este Manual (PDF)' : 'Baixar Capítulo (PDF)'}
            </button>
          </div>

          <div className="animate-entrance print:block">
            {selectedSubModule ? (
              renderAiManualView()
            ) : (
              <div className="space-y-6 text-left">
                {activeContent.content}
                
                {['membros', 'financeiro', 'celulas', 'secretaria', 'ai', 'seguranca', 'credenciais'].includes(activeContent.id) && (
                  renderCategorySubModules(activeContent.id)
                )}
              </div>
            )}
          </div>

          {/* Nav buttons inside pages */}
          <div className="border-t border-slate-100 pt-6 flex justify-between items-center text-xs font-bold text-slate-500 no-print">
            <span>Página de Consulta Dinâmica</span>
            <div className="flex gap-2">
              {manualData.map((sec, idx) => {
                const isSelected = sec.id === activeSection;
                return (
                  <button 
                    key={sec.id} 
                    onClick={() => { setActiveSection(sec.id); setSelectedSubModule(null); }} 
                    className={`w-3 h-3 rounded-full transition-all cursor-pointer ${isSelected ? 'bg-indigo-600 scale-125 shadow-sm' : 'bg-slate-200 hover:bg-slate-300'}`} 
                    title={sec.shortTitle}
                  />
                );
              })}
            </div>
          </div>
        </div>

      </div>
      )}
    </div>
  );
}
