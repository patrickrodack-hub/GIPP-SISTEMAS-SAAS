import React, { useState, useMemo, useContext } from 'react';
import { 
  Building2, Cpu, Code, Database, Palette, Lock, Sparkles, Layers,
  FileBarChart, FileText, Music, AlertTriangle, Globe, Phone, Mail,
  Instagram, Facebook, Check, CheckCircle2, Shield, QrCode, Search,
  Server, Sliders, Smartphone, Terminal, Zap, FileSpreadsheet, Box,
  ArrowRight, HeartHandshake, Eye, Download, Info, RefreshCw,
  Award, Key, BookOpen, Share2, Printer, Activity, Star, Calendar,
  Briefcase, GraduationCap, MapPin, Truck, ChevronRight, HardDrive,
  Copy, ExternalLink, SlidersHorizontal, CheckSquare, ShieldCheck,
  Radio, Workflow, Gauge, Flame, FileCheck, HelpCircle
} from 'lucide-react';

import { ChurchContext, playMenuSound } from '../App';

interface TechItem {
  id: string;
  name: string;
  category: 'code' | 'db' | 'design' | 'engine' | 'modules' | 'security';
  categoryLabel: string;
  version?: string;
  role: string;
  description: string;
  highlights: string[];
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  tag: string;
}

const ModuleSobre = () => {
  const { db } = useContext(ChurchContext);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTech, setSelectedTech] = useState<TechItem | null>(null);

  const categories = [
    { id: 'all', label: 'Todos os Pilares', count: 28, icon: Layers },
    { id: 'code', label: 'Linguagem & Código', count: 5, icon: Code },
    { id: 'db', label: 'Bancos de Dados & Storage', count: 4, icon: Database },
    { id: 'design', label: 'Interface & Design', count: 5, icon: Palette },
    { id: 'engine', label: 'Motores & Algoritmos', count: 7, icon: Cpu },
    { id: 'modules', label: 'Módulos Eclesiásticos', count: 4, icon: Building2 },
    { id: 'security', label: 'Segurança & Infra', count: 3, icon: ShieldCheck }
  ];

  const technologies: TechItem[] = useMemo(() => [
    // LINGUAGEM & CONSTRUÇÃO DO CÓDIGO
    {
      id: 'typescript',
      name: 'TypeScript 5.8 (Strict Mode)',
      category: 'code',
      categoryLabel: 'Linguagem & Código',
      version: 'v5.8.2',
      role: 'Linguagem Nuclear de Programação',
      description: 'Linguagem com tipagem estática e semântica rigorosa que blinda todo o ecossistema GIPP contra erros em tempo de execução, garantindo contratos confiáveis para membros, dízimos, ordenações e atas.',
      highlights: [
        'Tipagem estática 100% estrita em todas as entidades eclesiásticas',
        'Contratos de dados (DTOs) unificados entre cliente, servidor e banco',
        'Intellisense e refatoração segura em mais de 25.000 linhas de código'
      ],
      icon: Code,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      tag: 'Linguagem'
    },
    {
      id: 'react',
      name: 'React 19 (SPA Architecture)',
      category: 'code',
      categoryLabel: 'Linguagem & Código',
      version: 'v19.0.1',
      role: 'Motor de Interface & Renderização Reativa',
      description: 'Framework líder mundial para Single Page Applications (SPA). Fornece navegação instantânea de 0ms sem recarregamento de página, com Context API para sincronização global e componentes modulares.',
      highlights: [
        'Single Page Application com fluidez nativa sem reload de página',
        'Code-splitting sob demanda com React.lazy e Suspense para 40+ módulos',
        'Gerenciamento de estado global descentralizado e hooks de alta performance'
      ],
      icon: Cpu,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      tag: 'Framework'
    },
    {
      id: 'vite',
      name: 'Vite 6 & Rollup Bundler',
      category: 'code',
      categoryLabel: 'Linguagem & Código',
      version: 'v6.2.3',
      role: 'Ferramenta de Construção & Build Tooling',
      description: 'Ferramenta de compilação ultrarrápida com Hot Module Replacement (HMR) sub-50ms e empacotamento otimizado com Rollup, gerando bundles minificados com Tree-Shaking agressivo.',
      highlights: [
        'Compilação nativa em ES Modules para desenvolvimento ultrarrápido',
        'Tree-Shaking e separação granular de pacotes para produção',
        'Compatibilidade plena com React 19 e plugins modernos de pipeline'
      ],
      icon: Zap,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      tag: 'Build Tool'
    },
    {
      id: 'node-express',
      name: 'Node.js & Express 4 Full-Stack',
      category: 'code',
      categoryLabel: 'Linguagem & Código',
      version: 'v4.21.2',
      role: 'Camada de Servidor & Proxy Seguro',
      description: 'Backend robusto em Express 4 executando sobre Node.js com empacotamento compilado via ESBuild. Provê isolamento seguro para proxy de inteligência artificial, webhooks e endpoints protegidos.',
      highlights: [
        'Isolamento estrito de chaves de API sem exposição ao navegador',
        'Middlewares de segurança, headers CORS calibrados e proxy reverso',
        'Arquitetura híbrida que unifica client SPA e server API em um único ciclo'
      ],
      icon: Server,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      tag: 'Backend'
    },
    {
      id: 'esbuild',
      name: 'ESBuild Compiler Engine',
      category: 'code',
      categoryLabel: 'Linguagem & Código',
      version: 'v0.25.12',
      role: 'Compilador Go-Powered de Alta Velocidade',
      description: 'Motor de compilação em Go de altíssimo desempenho para empacotar o código do servidor Express em formato CJS/ESM em milissegundos com consumo mínimo de recursos.',
      highlights: [
        'Build do servidor em frações de segundo para deploys contínuos',
        'Minificação extrema de código TypeScript/JavaScript do backend',
        'Suporte a múltiplos targets de execução Node.js de produção'
      ],
      icon: Terminal,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      tag: 'Compiler'
    },

    // BANCOS DE DADOS & PERSISTÊNCIA
    {
      id: 'firestore',
      name: 'Google Cloud Firestore (NoSQL)',
      category: 'db',
      categoryLabel: 'Bancos de Dados & Storage',
      version: 'v12.13.0',
      role: 'Banco de Dados Principal em Tempo Real',
      description: 'Banco de dados NoSQL serverless distribuído globalmente pela Google Cloud. Fornece sincronização bidirecional em milissegundos para todas as congregações, obreiros e membros conectados.',
      highlights: [
        'Atualização em tempo real via WebSockets (onSnapshot listeners)',
        'Escalabilidade infinita sem necessidade de manutenção de servidores',
        'Regras de segurança robustas (firestore.rules) com isolamento granular'
      ],
      icon: Database,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      tag: 'Cloud DB'
    },
    {
      id: 'firestore-offline',
      name: 'Firestore Local Persistence (Cache L2)',
      category: 'db',
      categoryLabel: 'Bancos de Dados & Storage',
      version: 'Nativo',
      role: 'Persistência Offline Contínua',
      description: 'Camada de persistência local ativada via IndexedDbPersistence do Firestore SDK. Permite que secretários e tesoureiros continuem operando mesmo sem conexão com a internet, sincronizando tudo ao reconectar.',
      highlights: [
        'Operação 100% autônoma durante quedas de sinal e cultos em áreas remotas',
        'Fila de escrita assíncrona automática sincronizada com o servidor',
        'Resolução de concorrência e integridade referencial distribuída'
      ],
      icon: HardDrive,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      tag: 'Offline'
    },
    {
      id: 'indexeddb',
      name: 'IndexedDB Native Media Storage',
      category: 'db',
      categoryLabel: 'Bancos de Dados & Storage',
      version: 'indexedDbService.ts',
      role: 'Repositório de Mídias HD & Fotos do Navegador',
      description: 'Mecanismo proprietário de armazenamento local estruturado para grandes volumes de dados (fotos de membros em alta resolução, carimbos pastorais, assinaturas digitais, áudios e comprovantes em Blob).',
      highlights: [
        'Armazenamento de imagens e documentos sem onerar a cota do Firestore',
        'Leitura instantânea de 0ms a partir do disco rígido local do usuário',
        'Fallback resiliente automático com limpeza programada de memória'
      ],
      icon: Box,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      tag: 'Local Storage'
    },
    {
      id: 'backup-engine',
      name: 'Motor de Backup & Exportação JSON/ZIP',
      category: 'db',
      categoryLabel: 'Bancos de Dados & Storage',
      version: 'JSZip v3.10.1',
      role: 'Contingência & Preservação Histórica',
      description: 'Mecanismo nativo de extração de snapshots integrais do banco de dados em formato JSON estruturado e empacotamento compactado em ZIP para guarda e conformidade eclesiástica.',
      highlights: [
        'Cópia de segurança com um clique de todos os módulos e históricos',
        'Restauração assistida com validação prévia de integridade de esquema',
        'Empacotamento criptografável para transporte seguro e auditoria pastoral'
      ],
      icon: Download,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      tag: 'Backup'
    },

    // INTERFACE, DESIGN & ERGONOMIA VISUAL
    {
      id: 'tailwind',
      name: 'Tailwind CSS 4 (@tailwindcss/vite)',
      category: 'design',
      categoryLabel: 'Interface & Design',
      version: 'v4.1.14',
      role: 'Motor de Estilização & Design Tokens',
      description: 'Motor utility-first de alta precisão que padroniza paletas de cores, espaçamentos harmônicos, tipografia legível, grades dinâmicas e design adaptável para celulares, tablets, PCs e projetores.',
      highlights: [
        'Nova geração do Tailwind CSS compilada nativamente pelo Vite',
        'Eliminação completa de CSS não utilizado com pegada microscópica',
        'Paleta cromática eclesiástica sofisticada com contraste calibrado'
      ],
      icon: Palette,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      tag: 'CSS Engine'
    },
    {
      id: 'glassmorphism',
      name: 'Design System Glassmorphism & Modern UI',
      category: 'design',
      categoryLabel: 'Interface & Design',
      version: 'Proprietário',
      role: 'Estética Visual Premium & Ergonomia',
      description: 'Filosofia de design baseada em camadas de vidro fosco (backdrop-filter blur), bordas translúcidas sutis, micro-sombras e cantos orgânicos que reduzem o cansaço visual em longas jornadas de secretaria.',
      highlights: [
        'Efeito Glass Modern com profundidade óptica e ergonomia luminosa',
        'Modo Claro e Modo Escuro com transição suave e harmônica',
        'Layouts expansíveis calibrados para telões de igrejas e púlpitos digitais'
      ],
      icon: Eye,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      tag: 'UI Paradigm'
    },
    {
      id: 'motion',
      name: 'Motion 12 (Framer Motion Engine)',
      category: 'design',
      categoryLabel: 'Interface & Design',
      version: 'v12.23.24',
      role: 'Motor de Animações & Micro-Interações',
      description: 'Biblioteca de física e animações declarativas a 60fps para transições de rotas, abertura de gavetas, popovers, modais, drag-and-drop e sinalização de estados sem travamento de render.',
      highlights: [
        'Animações suaves e naturais baseadas em molas físicas (spring physics)',
        'Transições sem sobressalto entre abas e telas de gerenciamento',
        'Micro-interações que aumentam a percepção de agilidade do sistema'
      ],
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      tag: 'Animations'
    },
    {
      id: 'lucide',
      name: 'Lucide React Icons Collection',
      category: 'design',
      categoryLabel: 'Interface & Design',
      version: 'v0.546.0',
      role: 'Iconografia Vetorial SVG de Alta Resolução',
      description: 'Conjunto canônico de mais de 100 ícones SVG de linha vetorial precisa, desenhados para fácil identificação de departamentos, funções ministeriais, filtros e ações do sistema.',
      highlights: [
        'Ícones vetoriais com nitidez absoluta em telas Retina e 4K',
        'Identidade visual coerente em todos os módulos e relatórios',
        'Consumo otimizado via tree-shaking de ícones individuais'
      ],
      icon: Star,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      tag: 'Iconography'
    },
    {
      id: 'multi-themes',
      name: 'Sistemas Visuais Multitemas Retrô & Moderno',
      category: 'design',
      categoryLabel: 'Interface & Design',
      version: '5 Modos Integrados',
      role: 'Pluralidade de Interfaces Históricas',
      description: 'Engenharia visual exclusiva que permite ao usuário alternar a experiência completa da aplicação entre 5 layouts emblemáticos da história da computação eclesiástica.',
      highlights: [
        'Modern Glass UI: Elegância moderna com glassmorphism e cores vibrantes',
        'Windows 8.1 Metro Pro: Live Tiles ativas, Charms Bar e Start Screen autêntico',
        'Delphi 13 Florence IDE: Interface clássica com Object Inspector e menus VCL',
        'Clipper Autumn Anos 90: Modo terminal monocromático com bordas ASCII',
        'C++ Builder Retro: Docking visual clássico para operadores veteranos'
      ],
      icon: Sliders,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      tag: 'Themes'
    },

    // MOTORES TECNOLÓGICOS & ALGORITMOS
    {
      id: 'gemini-ai',
      name: 'Google Gemini API SDK (@google/genai)',
      category: 'engine',
      categoryLabel: 'Motores & Algoritmos',
      version: 'v2.4.0',
      role: 'Motor de Inteligência Artificial Cognitiva',
      description: 'Integração de ponta com os modelos Gemini da Google para geração de planos de aula da EBD alinhados aos 24 capítulos da Declaração de Fé CGADB/CPAD, sermões exegéticos e sínteses de atas.',
      highlights: [
        'Geração de materiais teológicos pentecostais com profundidade bíblica',
        'Redação assistida de certidões, cartas pastorais e sínteses executivas',
        'Consultoria estatística pastoral e diagnóstico de engajamento'
      ],
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      tag: 'IA Generativa'
    },
    {
      id: 'recharts-bi',
      name: 'Recharts Business Intelligence Engine',
      category: 'engine',
      categoryLabel: 'Motores & Algoritmos',
      version: 'v3.8.1',
      role: 'Motor Gráfico de Análise Financeira & Membresia',
      description: 'Motor de gráficos interativos com SVG responsivo para geração de DRE (Demonstrativo do Resultado do Exercício), fluxo de caixa comparativo, pirâmide etária de membros e índices de retenção.',
      highlights: [
        'Gráficos de Área, Barras Empilhadas, Linhas e Donut de alta precisão',
        'Tooltips analíticos com formatação de moeda brasileira (R$) e datas',
        'Visualização estratégica para decisões de convenções e diretorias'
      ],
      icon: FileBarChart,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      tag: 'BI & Charts'
    },
    {
      id: 'pdf-spooler',
      name: 'Spooler HD de Certificados & PDFs Canônicos',
      category: 'engine',
      categoryLabel: 'Motores & Algoritmos',
      version: 'jsPDF + pdf-lib + html2canvas',
      role: 'Motor de Geração Vetorial e Rasterizada HD',
      description: 'Conjunto de motores gráficos para emissão em 300 DPI de Certificados de Batismo, Apresentação de Crianças, Ordenação de Obreiros, Carteirinhas de Membro com foto, Carnês e Atas.',
      highlights: [
        'Renderização gráfica com marca d’água oficial, brasões e carimbos digitais',
        'Ajuste milimétrico para folhas A4, meio A4, carnês em 3 vias e credenciais PVC',
        'Exportação instantânea para impressão ou compartilhamento via WhatsApp'
      ],
      icon: Printer,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      tag: 'Document Engine'
    },
    {
      id: 'harmonic-engine',
      name: 'Harmonic Engine & Worship Reader (Web Audio)',
      category: 'engine',
      categoryLabel: 'Motores & Algoritmos',
      version: 'Proprietário Web Audio API',
      role: 'Motor Musical de Louvor & Cifras Interativas',
      description: 'Mecanismo completo para equipes de louvor com transposição de tons musicais em tempo real, detecção de notas em sustenido/bemol, capotraste inteligente, auto-scroll por pedal e metrônomo sintetizado.',
      highlights: [
        'Transposição de cifras sem perda de formatação textual ou quebras de linha',
        'Rolagem automática milimétrica com calibrador de velocidade e pausa rápida',
        'Metrônomo com Web Audio Oscillator sintetizando cliques rítmicos sem latência'
      ],
      icon: Music,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      tag: 'Audio & Music'
    },
    {
      id: 'optical-engine',
      name: 'Motor de Leitura Óptica & QR Code Scanner',
      category: 'engine',
      categoryLabel: 'Motores & Algoritmos',
      version: 'qrcode v1.5 + jsQR v1.4',
      role: 'Autenticação Canônica & Check-in Salinha Kids',
      description: 'Geração e leitura de QR Codes e Códigos de Barras usando a câmera do dispositivo. Utilizado para conferência de autenticidade de atas, credenciais pastorais e check-in seguro de crianças.',
      highlights: [
        'Geração instantânea de QR Code com criptografia de verificação',
        'Leitor óptico com câmera em tempo real para controle de acesso ao culto',
        'Pareamento infantil de pulseiras garantindo segurança na entrega aos pais'
      ],
      icon: QrCode,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      tag: 'Optical Reader'
    },
    {
      id: 'office-engine',
      name: 'Motor Office (Planilhas Excel & Documentos Word)',
      category: 'engine',
      categoryLabel: 'Motores & Algoritmos',
      version: 'FortuneSheet + xlsx + docx + mammoth',
      role: 'Suíte de Produtividade Eclesiástica Embarcada',
      description: 'Editor completo de planilhas interativas integrado ao sistema (@fortune-sheet/react) com importação e exportação de planilhas Excel (.xlsx) e confecção de ofícios em formato Word (.docx).',
      highlights: [
        'Planilha interativa estilo Excel/Google Sheets rodando 100% no navegador',
        'Importação e exportação de membros e dízimos via planilhas XLSX',
        'Geração e parsing de ofícios, cartas de apresentação e contratos em DOCX'
      ],
      icon: FileSpreadsheet,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      tag: 'Office Suite'
    },
    {
      id: 'push-engine',
      name: 'Motor de Notificações Web Push & Sons Hápticos',
      category: 'engine',
      categoryLabel: 'Motores & Algoritmos',
      version: 'web-push v3.6.7 + Web Audio Synth',
      role: 'Engajamento Pastoral & Feedback Sensorial',
      description: 'Mecanismo de notificações push para avisos importantes e disparos pastorais, complementado por gerador de feedback sonoro suave para ações de confirmação e salvamento no sistema.',
      highlights: [
        'Envio de alertas e convocações para celulares e computadores de membros',
        'Síntese de áudio procedural sem dependência de arquivos MP3 pesados',
        'Experiência tátil enriquecida com sons característicos de cada operação'
      ],
      icon: Radio,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      tag: 'Notifications'
    },

    // MÓDULOS & PILARES ECLESIÁSTICOS
    {
      id: 'secretaria-membro',
      name: 'Pilar de Secretaria Integrada & Membresia',
      category: 'modules',
      categoryLabel: 'Módulos Eclesiásticos',
      role: 'Gestão Completa do Corpo de Membros',
      description: 'Módulo centralizado para cadastramento unificado de membros, visitantes, congregações filiais, livro de atas histórico, credenciais em lote, termos de transferência e fichas cadastrais completas.',
      highlights: [
        'Registro de cargos, ordenações, batismos e dons espirituais de cada membro',
        'Livro de Atas digital com assinaturas canônicas e carimbos oficiais',
        'Carteirinhas com código de barras, fotos recortadas e validação canônica'
      ],
      icon: Briefcase,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      tag: 'Secretaria'
    },
    {
      id: 'tesouraria-dre',
      name: 'Pilar de Tesouraria, Contabilidade & DRE',
      category: 'modules',
      categoryLabel: 'Módulos Eclesiásticos',
      role: 'Gestão Financeira & Fiscal Eclesiástica',
      description: 'Controle rigoroso de entradas (dízimos e ofertas), saídas discriminadas por centro de custos, remessas de congregações filiais, conciliação bancária, carnês de contribuição e DRE gerencial.',
      highlights: [
        'Plano de contas padronizado para igrejas e convenções',
        'Demonstrativo do Resultado do Exercício com balancetes periódicos',
        'Geração de recibos, comprovantes e integração Pix via QR Code'
      ],
      icon: Award,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      tag: 'Financeiro'
    },
    {
      id: 'ebd-teologia',
      name: 'Pilar de EBD & Universidade Teológica (CPAD/CGADB)',
      category: 'modules',
      categoryLabel: 'Módulos Eclesiásticos',
      role: 'Educação Cristã & Formação Pastoral',
      description: 'Ambiente pedagógico estruturado nos 24 capítulos da Declaração de Fé das Assembleias de Deus (CGADB/CPAD). Acompanha chamadas da EBD, notas, turmas e cursos de Teologia (Básico, Médio e Avançado).',
      highlights: [
        'Matriz dogmática alinhada à tradição pentecostal clássica',
        'Apostilas dinâmicas com fundamentação bíblica, doutrina e quizzes',
        'Formação contínua de obreiros, diáconos, presbíteros e evangelistas'
      ],
      icon: GraduationCap,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      tag: 'Teologia'
    },
    {
      id: 'kids-frotas-worship',
      name: 'Pilar Operacional: Kids, Frotas & Louvor',
      category: 'modules',
      categoryLabel: 'Módulos Eclesiásticos',
      role: 'Operações Especializadas de Culto e Família',
      description: 'Módulos para a Salinha Kids (segurança com QR Code e ficha médica de crianças), Frotas & Veículos (combustível e manutenções) e Louvor (cifras, setlists e repertório de culto).',
      highlights: [
        'Salinha Kids com controle rigoroso de restrições alimentares e entrega segura',
        'Controle de quilometragem e revisões preventivas da frota de transporte da igreja',
        'Worship Setlist com projeção de versículos, hinário e cifras integradas'
      ],
      icon: HeartHandshake,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      tag: 'Operacional'
    },

    // SEGURANÇA, AUDITORIA & INFRAESTRUTURA
    {
      id: 'rbac-security',
      name: 'Controle de Acessos Granular (RBAC) & Auditoria',
      category: 'security',
      categoryLabel: 'Segurança & Infra',
      role: 'Blindagem de Permissões & Rastreabilidade',
      description: 'Sistema avançado de controle de perfis (Administrador, Pastor Presidente, Tesoureiro, Secretário, Líder de Departamento e Membro). Cada ação sensível gera log de auditoria permanente.',
      highlights: [
        'Nenhum usuário acessa telas ou informações fora de sua competência ministerial',
        'Histórico detalhado de inserções, alterações e exclusões com autor e timestamp',
        'Lixeira e restauração de dados para proteção contra exclusões acidentais'
      ],
      icon: Lock,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      tag: 'RBAC'
    },
    {
      id: 'lgpd-compliance',
      name: 'Conformidade LGPD & Proteção de Dados',
      category: 'security',
      categoryLabel: 'Segurança & Infra',
      role: 'Privacidade & Amparo Legal Jurídico',
      description: 'Adequação estrita à Lei Geral de Proteção de Dados (Lei nº 13.709/2018), salvaguardando dados sensíveis de fé e religião, informações financeiras de dízimos e registros de menores de idade.',
      highlights: [
        'Termos de consentimento e termos de adesão cadastral integrados',
        'Anonimização visual de dados sigilosos para operadores secundários',
        'Blindagem jurídica eclesiástica para diretorias e conselhos fiscais'
      ],
      icon: ShieldCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      tag: 'LGPD'
    },
    {
      id: 'cloud-infra',
      name: 'Arquitetura Serverless Global de Alta Disponibilidade',
      category: 'security',
      categoryLabel: 'Segurança & Infra',
      role: 'Infraestrutura em Nuvem Resiliente',
      description: 'Hospedagem em nuvem de nível empresarial com 99.98% de disponibilidade, backups contínuos em múltiplos data centers e distribuição via Content Delivery Network (CDN) com latência reduzida.',
      highlights: [
        'Escala automática instantânea para atender desde igrejas locais a convenções',
        'Criptografia de ponta a ponta (TLS 1.3 em trânsito e AES-256 em repouso)',
        'Zero necessidade de servidores locais físicos ou técnicos de TI dedicados'
      ],
      icon: Workflow,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      tag: 'Cloud'
    }
  ], []);

  const filteredTechnologies = useMemo(() => {
    return technologies.filter(tech => {
      const matchesCategory = activeCategory === 'all' || tech.category === activeCategory;
      const matchesSearch = 
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.highlights.some(h => h.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [technologies, activeCategory, searchTerm]);

  return (
    <div className="glass-modern p-6 md:p-10 rounded-[2.5rem] animate-entrance max-w-6xl mx-auto space-y-8">
      
      {/* CABEÇALHO HERO COM IDENTIDADE DO SISTEMA (CLARO & ALTA LEGIBILIDADE) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 p-8 md:p-12 rounded-[2.5rem] text-slate-850 shadow-none border border-slate-200/90">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-md shadow-indigo-500/20 transform hover:scale-105 transition-transform duration-300 p-1 shrink-0">
              <div className="w-full h-full bg-white/10 rounded-[1.8rem] flex items-center justify-center backdrop-blur-xs">
                <Building2 size={48} className="text-white" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2.5">
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  100% Serverless & Operacional
                </span>
                <span className="bg-indigo-50 text-indigo-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-200 font-mono">
                  {db.igreja?.saas_versao_sistema || "v13.5.0 Ultimate Platinum"}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase font-[Outfit] text-slate-900 leading-tight">
                {db.igreja?.saas_nome_sistema || "GIPP® SISTEMA INTEGRADO DE GESTÃO"}
              </h1>
              <p className="text-slate-600 text-sm md:text-base mt-2.5 max-w-2xl font-normal leading-relaxed">
                Ecossistema tecnológico eclesiástico de classe mundial, construído com tecnologias modernas, tolerância a falhas offline, arquitetura modular e motores inteligentes de IA.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
            <div className="bg-white border border-slate-200/80 px-5 py-3.5 rounded-2xl text-center shadow-xs">
              <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Módulos & Motores</span>
              <span className="text-2xl font-black text-indigo-700">{technologies.length} Ativos</span>
            </div>
            <div className="bg-white border border-slate-200/80 px-5 py-3.5 rounded-2xl text-center shadow-xs">
              <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Disponibilidade</span>
              <span className="text-2xl font-black text-emerald-600">99.98% Cloud</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO DESENVOLVEDOR & CRIADOR (PATRICK PESSOA) NO TOPO DO FORMULÁRIO */}
      <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-slate-200/90 shadow-sm p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="relative shrink-0">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-indigo-100 shadow-md overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-4xl p-1">
              <img 
                src={db.igreja?.saas_dev_imagem || db.igreja?.icone_sistema || "https://cdn-icons-png.flaticon.com/512/3004/3004613.png"} 
                alt="Desenvolvedor" 
                className="w-full h-full object-cover rounded-full bg-white" 
              />
            </div>
            <div 
              className="absolute bottom-1 right-1 bg-emerald-500 w-9 h-9 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-md text-white" 
              title="Desenvolvedor & Engenheiro de Software Verificado"
            >
              <Check size={16} strokeWidth={3} />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 px-3.5 py-1 rounded-full border border-indigo-200">
                Arquiteto de Software & Fundador
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3.5 py-1 rounded-full border border-emerald-200">
                Engenharia de Sistemas Eclesiásticos
              </span>
            </div>

            <h3 className="text-3xl font-black text-slate-900 uppercase font-[Outfit] tracking-tight">
              {db.igreja?.saas_nome_desenvolvedor || "PATRICK PESSOA"}
            </h3>

            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal max-w-3xl">
              {db.igreja?.saas_descricao_sistema || 
                "Idealizador, arquiteto e engenheiro responsável pela concepção estrutural, modelos de dados, interface e algoritmos do ecossistema GIPP®. Sistema concebido para elevar a excelência administrativa pastoral, conectando rigor teológico, segurança jurídica e tecnologia de ponta."}
            </p>

            {/* Links e Botões Oficiais */}
            <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-2">
              <a 
                href={db.igreja?.saas_site || "https://gipp-site.vercel.app/"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-200 cursor-pointer"
              >
                <Globe size={14} />
                Portal Oficial
              </a>

              {db.igreja?.saas_whatsapp && (
                <a 
                  href={`https://wa.me/${db.igreja.saas_whatsapp}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-200 cursor-pointer"
                >
                  <Phone size={14} />
                  WhatsApp Suporte
                </a>
              )}

              {db.igreja?.saas_email && (
                <a 
                  href={`mailto:${db.igreja.saas_email}`} 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-200"
                >
                  <Mail size={14} />
                  Contato Direto
                </a>
              )}

              {db.igreja?.saas_instagram && (
                <a 
                  href={db.igreja.saas_instagram.startsWith('http') ? db.igreja.saas_instagram : `https://instagram.com/${db.igreja.saas_instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-200 cursor-pointer"
                >
                  <Instagram size={14} />
                  Instagram
                </a>
              )}

              {db.igreja?.saas_facebook && (
                <a 
                  href={db.igreja.saas_facebook.startsWith('http') ? db.igreja.saas_facebook : `https://facebook.com/${db.igreja.saas_facebook}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-200 cursor-pointer"
                >
                  <Facebook size={14} />
                  Facebook
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL DE NAVEGAÇÃO DOS PILARES & BUSCA EM TEMPO REAL */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-2.5 font-[Outfit]">
              <Layers size={22} className="text-indigo-600" />
              Mapeamento Tecnológico & Pilares de Construção
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Explore cada ferramenta, linguagem, banco de dados, motor e pilar utilizado no desenvolvimento do sistema.
            </p>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tecnologia, motor..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Abas de Categorias */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  try { playMenuSound(); } catch (e) {}
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-600/30' 
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {cat.id === 'all' 
                    ? technologies.length 
                    : technologies.filter(t => t.category === cat.id).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* GRID DE CARTÕES TECNOLÓGICOS DETALHADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechnologies.map((tech) => {
          const Icon = tech.icon;
          return (
            <div 
              key={tech.id}
              onClick={() => {
                try { playMenuSound(); } catch (e) {}
                setSelectedTech(tech);
              }}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-100 to-transparent rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-125"></div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className={`p-3 rounded-2xl ${tech.bgColor} ${tech.color} border ${tech.borderColor} shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {tech.tag}
                    </span>
                    {tech.version && (
                      <span className="text-[10px] font-bold text-slate-400 mt-1 font-mono">
                        {tech.version}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-black text-slate-850 text-base mb-1 group-hover:text-indigo-600 transition-colors">
                  {tech.name}
                </h3>
                <span className="text-[11px] font-bold text-indigo-600 block mb-3">
                  {tech.role}
                </span>

                <p className="text-xs text-slate-600 leading-relaxed font-normal mb-4">
                  {tech.description}
                </p>
              </div>

              <div>
                <div className="border-t border-slate-100 pt-3 space-y-1.5 mb-4">
                  {tech.highlights.slice(0, 2).map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-slate-500 font-medium">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{h}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                  <span>Ver detalhes arquiteturais</span>
                  <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTechnologies.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Info size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">Nenhuma ferramenta encontrada</h3>
          <p className="text-xs text-slate-400 mt-1">Tente buscar por outro termo ou selecione a categoria "Todos os Pilares".</p>
          <button 
            type="button" 
            onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* MODAL DE DETALHES TÉCNICOS DA TECNOLOGIA SELECIONADA */}
      {selectedTech && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedTech(null)}
        >
          <div 
            className="bg-white rounded-[2rem] p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative animate-scaleUp overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3.5 rounded-2xl ${selectedTech.bgColor} ${selectedTech.color} border ${selectedTech.borderColor}`}>
                  {React.createElement(selectedTech.icon, { size: 26 })}
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900 leading-tight">
                    {selectedTech.name}
                  </h3>
                  <span className="text-xs font-bold text-indigo-600">
                    {selectedTech.role}
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedTech(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-normal">
                {selectedTech.description}
              </div>

              <div>
                <h4 className="font-extrabold text-slate-850 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <CheckSquare size={13} className="text-indigo-600" />
                  Destaques de Engenharia & Impacto no Sistema:
                </h4>
                <div className="space-y-2">
                  {selectedTech.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/60 text-slate-700">
                      <CheckCircle2 size={15} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                <span>Categoria: <strong>{selectedTech.categoryLabel}</strong></span>
                {selectedTech.version && (
                  <span>Versão ativa: <strong className="font-mono text-slate-600">{selectedTech.version}</strong></span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTech(null)}
              className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}

      {/* AVISO LEGAL & DIREITOS AUTORAIS */}
      <div className="bg-rose-50 border-2 border-rose-200 p-8 rounded-[2rem] flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="p-4 bg-rose-500 text-white rounded-2xl shrink-0 shadow-lg shadow-rose-500/30 relative z-10">
          <AlertTriangle size={36} />
        </div>
        <div className="relative z-10 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-800 px-2.5 py-0.5 rounded-md">
              Propriedade Intelectual & Lei 9.609/98
            </span>
          </div>
          <h4 className="font-black text-rose-800 text-xl uppercase tracking-wider mb-2">
            Aviso Legal de Direitos Autorais & Proteção de Código
          </h4>
          <p className="text-xs font-semibold text-rose-900 leading-relaxed text-justify">
            É estritamente <strong>PROIBIDA</strong> a cópia, clonagem, engenharia reversa, descompilação, redistribuição, revenda ou comercialização deste software, total ou parcialmente, sob qualquer pretexto, sem a prévia, expressa e documentada autorização do seu criador e desenvolvedor exclusivo, <strong>{db.igreja?.saas_nome_desenvolvedor || "PATRICK PESSOA"}</strong>. O uso e distribuição não autorizados constituem crime de violação de direito autoral (Art. 184 do Código Penal e Art. 12 da Lei do Software nº 9.609/1998), sujeitando os infratores a sanções cíveis e criminais cabíveis.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ModuleSobre;
