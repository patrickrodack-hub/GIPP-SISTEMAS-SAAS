import React, { useState, useEffect, useContext, createContext, useMemo, memo, useRef, isValidElement } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { 
  LayoutDashboard, Users, Building2, CreditCard, FileText, Settings, 
  LogOut, ChevronDown, ChevronRight, Plus, Edit, Trash2, Printer, 
  Search, Menu, X, DollarSign, BookOpen, Globe, Calendar, UserCheck, 
  CheckCircle, AlertCircle, ArrowUpCircle, ArrowDownCircle, Filter, MapPin, Briefcase, Heart, GraduationCap, Shield, Download,
  ClipboardList, Gift, PieChart as PieChartIcon, Upload, Image as ImageIcon, Database, Save, RefreshCw, Trash,
  Phone, Mail, Code, Info, Share2, Home, FileBadge, Stamp, Wifi, WifiOff, Star, HeartHandshake, Camera,
  CheckSquare, MessageCircle, Send, PlayCircle, Clock, List, Smartphone, User, UserPlus, Video,
  FileSpreadsheet, CheckCheck, Flag, Smile, Copy, Bold, Italic, Type, Activity, Receipt, RotateCcw, Ban, Archive, Printer as PrinterIcon,
  MoreVertical, Bell, Truck, Layers, Lock, ScrollText, Megaphone, Award, FileBarChart, Mic,
  FileCheck, Paperclip, ExternalLink, FileJson, UploadCloud, AlertTriangle, Check, EyeOff, Eye, Tent, Footprints, Zap, ZapOff, Target, Cloud,
  TrendingUp, TrendingDown, PenTool, Book, Droplets, ChevronLeft, Sparkles, Cpu, Palette, Loader2, MessageSquare, Music,
  MousePointer2, Move, Type as TypeIcon, ImagePlus, DownloadCloud, GitBranch, History,
  MonitorPlay, Palette as PaletteIcon, Hash, Printer as PrintIcon, Wallet, Landmark, FileInput, RotateCcw as RestoreIcon,
  LayoutTemplate, MousePointerClick, Image, Baby, HardHat, ShieldCheck, QrCode, UserCircle, Maximize, Minimize,
  Sun, Moon, Package, Flame, Minus, Newspaper, BookOpenText, IdCard, Badge,
  Inbox, Send as SendIcon, Reply, Forward, MoreHorizontal, Key, Headset, Server, Sliders
} from 'lucide-react';

import { 
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, 
  setDoc, onSnapshot, query, writeBatch, where, getDocs,
  enableIndexedDbPersistence
} from 'firebase/firestore';

import { preprocessImage, storeMedia, getMedia, clearMedia } from '../lib/indexedDbService';

import {
  ChurchContext, CachedImage, callGeminiAI, resizeImageAndCompress,
  Button, FormInput, FormSelect, BackupModal, ConfirmModal,
  GenericTable, GenericModal, PageBoundaryIndicators, DocumentPreviewModal, PrintSystem,
  AutocompleteRecipient, SharedEmailModule,
  playMenuSound, playNotificationSound, getTodayDate, formatDateLocal, isValidCPF, formatCPF,
  copyToClipboard, generatePixPayload, safeRender, safeText, ICON_MAP, getIcon, THEME_COLORS, REGRA_DOMINGOS, PortalHeader
} from '../App';

// Exporting component
const ModuleChangelog = () => (
    <div className="glass-modern p-10 rounded-[2.5rem] animate-entrance max-w-3xl mx-auto">
        <h2 className="text-3xl font-black text-slate-800 mb-6">Histórico de Atualizações</h2>
        <div className="space-y-8">
            
            {/* NOVO BLOCO ADICIONADO PARA VERSÃO 6.5.0 */}
            <div className="relative pl-8 border-l-2 border-indigo-600 animate-entrance">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                <h3 className="font-extrabold text-lg text-indigo-700 font-[Outfit]">v6.5.0 - Manual de Bordo Integrado, Matriz de Recursos SaaS & Segurança de Acessos Orbital</h3>
                <p className="text-xs text-indigo-500 font-black uppercase mb-3 tracking-wider">Junho 2026 (Atual)</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Manual Interativo GIPP:</strong> Desenvolvimento e acoplamento do Manual do Usuário oficial, composto por 26 tópicos dedicados que explicam as capacidades, regras e fluxos de cada módulo operacional do software de forma fluida.</li>
                    <li><strong className="text-slate-700 font-sans">Segurança & Usuários com Design Orbital:</strong> Redesenho integral da ficha cadastral de "Usuários & Níveis". Implementação de layout Glassmorphism com elementos em órbita holográfica, brasão de segurança em rotação, campos de atalho rápido e isolamento absoluto de z-index via Portrais do React (`createPortal`) no escopo do body.</li>
                    <li><strong className="text-slate-700">Matriz de Ativação de Módulos (SaaS):</strong> Nova tabela panorâmica e ativa no módulo do desenvolvedor, demonstrando visualmente a liberação, status e dotação de recursos por classificação contratual (Planos Básico, Standard e Avançado) em tempo real.</li>
                    <li><strong className="text-slate-700">Vitrine de Ecossistema de Software:</strong> Expansão técnica substancial do módulo "Sobre", promovendo o detalhamento dinâmico de 10 motores e subsistemas tecnológicos que dão solidez, alta redundância e velocidade ao GIPP Gold Edition.</li>
                </ul>
            </div>

            {/* NOVO BLOCO ADICIONADO PARA VERSÃO 6.4.0 */}
            <div className="relative pl-8 border-l-2 border-slate-300">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-400"></div>
                <h3 className="font-bold text-lg text-slate-700">v6.4.0 - Arquitetura Modular de Cursos, Certificados de Alta Resolução & Formulários Unificados</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Junho 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700 font-sans">Modularização de Dados de Cursos:</strong> Transferência e descentralização da pesada estrutura do banco de dados de cursos, ementas de perguntas de quiz e mídias de `src/App.tsx` para o módulo `/src/components/ModuleCoursesData.tsx`. Otimização que reduz o tamanho do pacote principal, tornando o sistema infinitas vezes mais suave, rápido e leve.</li>
                    <li><strong className="text-slate-700">Certificados HD e Resolução de Camadas:</strong> Implementação de portal de renderização (React Portals) para os certificados oficiais de conclusão e visualizadores de PDF, operando com empilhamento z-index seguro a nível de body, contornando sobreposições na impressão e garantindo downloads imaculados em alta resolução.</li>
                    <li><strong className="text-slate-700">Unificação de Envio e Mensagens de Incentivo:</strong> Padronização do formulário de correspondência e mensagens de felicitação aos estudantes no módulo de EAD, unificando a experiência visual com a mesma linguagem premium dos demais cadastros do sistema.</li>
                </ul>
                <div className="mt-4 p-3 bg-indigo-50/80 border border-indigo-100 rounded-xl text-xs text-indigo-700 font-medium">
                  <strong>Solicitante Oficial:</strong> O desenvolvimento e as atualizações do módulo de Acompanhamento de Cursos e Capacitações EAD foram idealizados e solicitados pelo <span className="underline decoration-indigo-300 decoration-2 font-bold text-indigo-800 font-black">Pb. Deivison Pessoa</span>.
                </div>
            </div>
            
            {/* BLOCO ADICIONADO PARA VERSÃO 6.3.0 */}
            <div className="relative pl-8 border-l-2 border-slate-300">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-400"></div>
                <h3 className="font-bold text-lg text-slate-700">v6.3.0 - Rename da Mentoria Acadêmica, Novo Curso Apologético CPAD & Gremiação</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Junho 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Módulo EAD Cursos de Capacitação:</strong> Alteração formal do nome do antigo módulo de "Acompanhar Alunos" para "EAD Cursos de Capacitação", alinhando o sistema de mentoria com propostas pedagógicas modernas e interativas.</li>
                    <li><strong className="text-slate-700">Lições Bíblicas em Defesa da Fé:</strong> Inserção do novo curso curricular baseado na clássica obra de apologética do comentarista Esequias Soares (Editora CPAD). O curso possui 10 módulos doutrinários completos cobrindo defesa teísta, inerrância bíblica, doutrina da Trindade e refutação de seitas contemporâneas com quizes de 5 perguntas.</li>
                    <li><strong className="text-slate-700">Integração com Gremiação:</strong> Implementação do suporte a dotação de mérito e gremiações estritas de conclusão de curso para os graduados em "Defesa da Fé", sincronizando as credenciais com o banco de dados.</li>
                </ul>
            </div>

            {/* BLOCO PARA VERSÃO 6.2.0 */}
            <div className="relative pl-8 border-l-2 border-slate-300">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-400"></div>
                <h3 className="font-bold text-lg text-slate-700">v6.2.0 - Isolamento Estrito de Impressão (Print Isolation) & Correção de PDF</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3 text-slate-400">Junho 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Impressão Limpa e Isolada:</strong> Reestruturação da regra CSS `@media print` para garantir que apenas o conteúdo do documento (Relatórios, Carnês, Liturgias) seja exibido. Todo o restante da interface (Menús, Botões, Modais) é removido do spooler de renderização garantindo folhas em branco apenas com as informações centrais injetadas.</li>
                </ul>
            </div>

            {/* BLOCO PARA VERSÃO 6.1.0 */}
            <div className="relative pl-8 border-l-2 border-slate-300">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-400"></div>
                <h3 className="font-bold text-lg text-slate-700">v6.1.0 - Planeamento Litúrgico Completo, Séries de Sermões & Sistema de Bloqueio de Duplicados (Anti-Duplicidade)</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Maio 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Mapeamento Litúrgico & Séries de Sermões:</strong> Novo módulo interativo no Portal do Pastor para planeamento completo de cultos. Permite gerenciar temas de mensagens, designar dirigentes da liturgia, pregadores, leituras bíblicas oficiais, gerenciar playlists detalhadas de cânticos (hinos de louvor) e adicionar esboços ou resumos homiléticos das pregações compartilhadas, com suporte técnico a impressão física direta.</li>
                    <li><strong className="text-slate-700">Prevenção e Bloqueio de Registros Duplicados:</strong> Auditoria ativa no momento de novos cadastros e edições. Agora, o sistema previne de forma automática dupla inserção de membros (com mesmo Nome ou CPF), logins redundantes de usuários na plataforma, múltiplos fornecedores com o mesmo CNPJ, classes duplicadas na EBD ou centros de custos idênticos, emitindo alertas imediatos.</li>
                    <li><strong className="text-slate-700">Estabilização do Banco em Tempo Real:</strong> Sincronização automatizada da coleção de liturgias pastorais (`pastor_liturgias`) no Firestore para persistência de dados fidedigna com os membros.</li>
                </ul>
            </div>

            {/* BLOCO PARA VERSÃO 6.0.0 */}
            <div className="relative pl-8 border-l-2 border-slate-300">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-400"></div>
                <h3 className="font-bold text-lg text-slate-700">v6.0.0 - Spooler de Multi-Páginas, Injetor On-The-Fly, Resoluções de Conflitos & Refatoração Geral</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Maio 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-500 text-sm">
                    <li><strong className="text-slate-700">Injetor de Estilos de Impressão On-The-Fly (`DynamicPrintStyles`):</strong> Criação de um gerador dinâmico de folhas de estilo injetadas em tempo de execução. Lê o estado de rotação (Retrato/Paisagem), as margens personalizadas e o tipo de viewport para anular conflitos no motor do navegador nativo.</li>
                    <li><strong className="text-slate-700">Resolução da Margem Dupla de Impressão Física:</strong> Correção definitiva do bug onde as margens nativas do spooler de impressão somavam-se ao preenchimento interno do documento (`.doc-padding`). Criamos regras de reset no cabeçalho do spooler que limpam os paddings internos de forma fluida durante a impressão real.</li>
                    <li><strong className="text-slate-700">Aprimoramento de Renderização de Multi-Páginas (PDF):</strong> Reengenharia no cálculo de avanço e quebra de página de imagens no exportador PDF para evitar listras ou cortes de textos no rodapé, aumentando a estabilidade do utilitário de relatórios consolidados de alta densidade.</li>
                    <li><strong className="text-slate-700">Correção de Bloqueio Cross-Origin por Sandbox:</strong> Remoção de incompatibilidades críticas de renderizadores de iframe em navegadores móveis, centralizando as chamadas diretamente no motor do spooler do sistema operacional através de acionamento nativo `window.print()`.</li>
                    <li><strong className="text-slate-700">Varredura e Auditoria do Código:</strong> Análise profunda de integridade geral do sistema, remoção de redundâncias de estilos, linting bem-sucedido e estabilização de estado local sem vazamento de memória.</li>
                </ul>
            </div>

            {/* BLOCO PARA VERSÃO 5.9.0 */}
            <div className="relative pl-8 border-l-2 border-slate-300">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-400"></div>
                <h3 className="font-bold text-lg text-slate-700">v5.9.0 - Escala de Impressão Dinâmica, Margens ABNT & Impressão Física Blindada</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Maio 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-500 text-sm">
                    <li><strong className="text-slate-700">Ajustar à Largura (Auto-Fit Inteligente):</strong> Algoritmo adaptativo avançado integrado na tela de impressão. Ele lê e avalia elementos que transbordam horizontalmente (tabelas e grids longos) e reduz as dimensões do documento na proporção exata necessária para encaixá-lo nas margens físicas da página A4 sem cortes de texto ou de bordas.</li>
                    <li><strong className="text-slate-700">Seletor de Margens Reguláveis:</strong> Suporte completo no spooler para pré-escolha da margem física ideal do documento (<span className="italic">Margem ABNT 20mm/15mm, Moderada 15mm/10mm ou Estreita 10mm/5mm</span>).</li>
                    <li><strong className="text-slate-700">Orientação de Canal Dinâmica:</strong> Flexibilidade total de rotacionamento rápido entre Retrato (Portrait) e Paisagem (Landscape) diretamente nos controles internos do preview oficial.</li>
                    <li><strong className="text-slate-700">Resolução do Bloqueio Cross-Origin:</strong> Correção definitiva dos problemas de segurança e frame sandboxing do navegador na impressão física ao substituir silenciosos `BlobURL` iframes por acionadores nativos e diretos do motor sistêmico de impressão via <code className="text-xs bg-indigo-50 text-indigo-600 rounded px-1">window.print()</code>.</li>
                </ul>
            </div>

            {/* BLOCO PARA VERSÃO 5.8.0 */}
            <div className="relative pl-8 border-l-2 border-slate-300">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-400"></div>
                <h3 className="font-bold text-lg text-slate-700">v5.8.0 - Correção de Importação de Imagem & Estabilização de PDF Premium</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Maio 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-500 text-sm">
                    <li><strong className="text-slate-700">Sincronização e Importação de Avatares:</strong> Correção do fluxo de processamento de avatares com auto-recorte pré-banco para aceitar imagens em Base64 e imagens com restrições de domínios externos de maneira transparente.</li>
                    <li><strong className="text-slate-700">Renderizador de PDF Livre de Falhas:</strong> Reforço no mecanismo de geração e exportação de relatórios corporativos para contornar crash de segurança gerados por canvas contaminados ("tainted canvases") vindos de mídias remotas sem cabeçalho CORS.</li>
                </ul>
            </div>

            {/* BLOCO PARA VERSÃO 5.7.0 */}
            <div className="relative pl-8 border-l-2 border-slate-300">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-400"></div>
                <h3 className="font-bold text-lg text-slate-700">v5.7.0 - PWA com Segurança SaaS, Margem de Impressão de 20mm & Travamento A4</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Maio 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-500 text-sm">
                    <li><strong className="text-slate-700">PWA Multiplataforma SaaS Persistente:</strong> Otimização do fluxo de instalação do PWA. O sistema agora detecta e armazena permanentemente em `localStorage` o endereço exato do subdomínio SaaS atualmente usado, injetando dinamicamente essa rota como `start_url` no manifesto do aplicativo em celulares Android, iOS, tablets ou computadores Windows e macOS, evitando perdas de redirecionamento ou necessidade de nova digitação pelo usuário.</li>
                    <li><strong className="text-slate-700">Serviço de Emissão e Impressão Reforçado (Largura A4 de 794px):</strong> Implementação de travamento rígido e invariável das dimensões de visualização e captura em padrão absoluto de `794px` (Formato Retrato A4) e `1123px` (Formato Paisagem A4/Certificados) para garantir layout fiel WYSIWYG, evitando scrolls e refinando o alinhamento pós-exportação.</li>
                    <li><strong className="text-slate-700">Margem de Segurança Estendida de 20mm:</strong> Definição e proteção de margem segura de `20mm` no preenchimento físico dos documentos oficiais através do seletor `.doc-padding` blindado no escopo final de renderização, eliminando problemas de quebra de parágrafo ou corte de tabelas em impressoras padrão.</li>
                </ul>
            </div>

            {/* BLOCO ADICIONADO PARA REFLETIR AS ÚLTIMAS MUDANÇAS NA VERSÃO 5.6.0 */}
            <div className="relative pl-8 border-l-2 border-slate-300">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-400"></div>
                <h3 className="font-bold text-lg text-slate-700 font-sans">v5.6.0 - Assistente Mary Customizável, Moderação de Suporte & Auto‑Backup</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Maio 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-500 text-sm">
                    <li><strong className="text-slate-700">Avatar Mary Personalizável (Importação Local):</strong> Otimização da Assistente Virtual padrão "Mary". Removemos a opção genérica e dispersa de avatar anterior "Outro", integrando em seu lugar um botão direto e simplificado sobre o card de Mary para importação local. Permite carregar qualquer imagem do computador do usuário, realizando auto-recorte e pré-processamento Canvas automático antes de persistir no banco.</li>
                    <li><strong className="text-slate-700">Gerenciamento no Painel de Suporte:</strong> Inclusão de botões de controle térmico e purga de tickets de atendimento no portal do desenvolvedor. Operadores master podem agora excluir conversas específicas individualmente diretamente no box ativo de chat selecionado, além de acionar a limpeza global ("Apagar Todas as Mensagens") caso o banco precise ser purgado de atendimentos passados.</li>
                    <li><strong className="text-slate-700">Motor de Auto-Backup Silencioso:</strong> Inicialização de uma rotina automatizada que roda nos bastidores do sistema, empacotando os dados estruturados canônicos sem imagens redundantes e salvando snapshots estruturais de segurança direto no Firestore a cada intervalo programado, protegendo o sistema contra interrupções.</li>
                </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-emerald-500">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <h3 className="font-bold text-lg text-emerald-800">v5.5.0 - Super Resolução & Cache Local no IndexedDB</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Maio 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Cache de Média Persistente via IndexedDB:</strong> Criação de subsistema de armazenamento local offline usando o banco IndexedDB do navegador. Imagens pesadas como avatares de membros, fotos de pastores, do assistente de IA, logos e cartazes de eventos são guardadas fisicamente na máquina do usuário, eliminando o tráfego repetitivo e minimizando a franquia de dados móveis sob conexões 3G/4G restritas.</li>
                    <li><strong className="text-slate-700">Pré-processamento Científico de Uploads:</strong> Redução drástica das dimensões de imagens direto no cliente por meio de renderizadores Canvas HTML5 híbridos antes do upload no Firestore. Limita resoluções excessivas para 400x400 e otimiza a compressão JPEG para uma proporção ideal de 75%, mitigando o consumo de largura de banda.</li>
                    <li><strong className="text-slate-700">Componente Inteligente &lt;CachedImage&gt;:</strong> Substituição de tags img nativas por um elemento sob medida com ciclo de vida otimizado. Ele intercepta as URLs do banco e renderiza imagens a partir do banco de dados IndexedDB local em nanossegundos, gerando uma experiência de navegação instantânea.</li>
                </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-indigo-600">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                <h3 className="font-bold text-lg text-indigo-800">v5.3.0 - Assistência Virtual Global & Ficha Institucional Canônica</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Maio 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Centralização do Painel Master de IA (SaaS Global):</strong> Integração e transferência completa dos controles da Assistente Virtual Sofia/Gabriel/Graça para uma aba unificada no Painel Master Administrativo. Suporta upload de avatares com compressão local (<strong className="text-slate-700">&lt;500KB</strong>), customização refinada de System Prompt para teologia/suporte, além de regras dinâmicas de FAQ baseadas em correspondência de palavras-chave com respostas automatizadas instantâneas.</li>
                    <li><strong className="text-slate-700">Reengenharia da Ficha da Igreja (Canônica):</strong> Expansão completa do relatório oficial de cadastro institucional (`rel_igreja`) para documentar todos os dados canônicos da denominação (registro eclesiástico consocial, convenções de pastores federal e estadual, pioneiros e ano de introdução no Brasil), resumo formatado de estatuto social e regimento, cargos e CPFs de toda a diretoria executiva, além de dados bancários completos e chaves PIX de recebimentos da sede.</li>
                </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-slate-400">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.5)]"></div>
                <h3 className="font-bold text-lg text-slate-800">v5.2.0 - Otimização de Performance & Customização Master</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Maio 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Otimização de Performance (Paginação Firestore):</strong> Refatoração dos ouvintes do banco de dados do Firestore para Membros e Histórico Financeiro, com limites (`limit()`) de dados para reduzir a carga inicial, além de possuir filtros temporais inteligentes e botões rápidos para carregar mais registros sob demanda.</li>
                    <li><strong className="text-slate-700">Customização IA via Portal SaaS:</strong> Possibilidade de alterar e persistir o nome e a foto de perfil (Avatar) do Assistente Virtual diretamente no Painel Master SaaS de forma unificada e em tempo real.</li>
                    <li><strong className="text-slate-700">Estabilização do Motor de IA:</strong> Correção completa do erro de HTTP 404 e timeouts nas rotas de geração teológica e financeira, garantindo que o módulo Pastoral IA responda instantaneamente.</li>
                </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-fuchsia-500">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-fuchsia-600 shadow-[0_0_10px_rgba(192,38,211,0.5)]"></div>
                <h3 className="font-bold text-lg text-fuchsia-700">v5.1.0 - Suporte Master & Portal IA Flutuante</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Maio 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Assistente Virtual (Chat Flutuante):</strong> Refatoração do widget flutuante persistente no sistema onde os membros e líderes podem tirar dúvidas operacionais ou usufruir da inteligência artificial adaptada à Base de Dados da igreja (FAQ dinâmico).</li>
                    <li><strong className="text-slate-700">Painel de Operador de Suporte:</strong> Lançamento do módulo "Op. de Suporte" focado em centralizar as interações, permitir bloqueio de IA em chamados abusivos e delegar a resposta manual para a equipe Pastoral/Atendimento da Sede, suportando anexos de log gerados pelo bot.</li>
                    <li><strong className="text-slate-700">Correção de UX:</strong> Resolução de bugs relatados onde botões superiores entravam em conflito com as sobreposições flutuantes ou eventos pointer-events css.</li>
                </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-indigo-500">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                <h3 className="font-bold text-lg text-indigo-700">v5.0.0 - Cofre Pastoral Protegido & Validação Financeira</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Maio 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Abas de Segurança no Cofre Pastoral:</strong> Desdobramento do conteúdo restrito do cofre em abas separadas para Esboços de Sermão, Atas de Gabinete e Financeiro.</li>
                    <li><strong className="text-slate-700">Controle de Acesso Financeiro:</strong> Acesso às informações financeiras restrito exclusivamente ao Pastor Presidente (seletivo), exibindo tela informativa de bloqueio para outros perfis e protegendo os dados sensíveis da igreja.</li>
                    <li><strong className="text-slate-700">Validação Tempesctiva de Calendário:</strong> Implementada verificação inteligente no formulário de despesas para impedir a seleção de datas de vencimento ou pagamento anteriores ao dia de hoje, emitindo alertas do tipo toast para guiar o usuário.</li>
                </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-emerald-400">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <h3 className="font-bold text-lg text-emerald-700">v4.9.5 - Modo Escuro Profissional (Design Tokens)</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Maio 2026 (Atual)</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Dark Mode Nativo:</strong> Implementação de uma arquitetura profissional de CSS utilizando <em>Design Tokens</em> (Variáveis). O sistema agora transita perfeitamente entre os modos Claro e Escuro, ajustando fundos, textos e bordas de forma nativa e elegante em todos os módulos, assim como os grandes painéis SaaS do mercado.</li>
                    <li><strong className="text-slate-700">Correção Visual:</strong> Foram eliminados os problemas de contraste em tabelas e formulários quando o modo escuro era ativado, garantindo legibilidade total e conforto visual para o uso noturno.</li>
                </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-amber-400">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                <h3 className="font-bold text-lg text-amber-700">v4.9.0 - Portal Premium, RSVP & Gestão de Escalas</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Maio 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Confirmação de Presença (RSVP):</strong> Os membros agora podem sinalizar "Estarei Presente" ou "Não Estarei" nas escalas e eventos diretamente pelo Portal do Membro.</li>
                    <li><strong className="text-slate-700">Alertas de Baixa na Escala:</strong> A liderança e secretaria recebem notificações vermelhas em tempo real (no sino de avisos) sempre que um membro declina uma escala, facilitando a substituição rápida.</li>
                    <li><strong className="text-slate-700">Relatório Oficial de Escala (PDF):</strong> Novo botão de impressão nas tarefas/escalas que gera um documento de alta qualidade com o status de confirmação da equipa, pronto para partilhar no WhatsApp.</li>
                    <li><strong className="text-slate-700">Novo Design do Portal do Membro:</strong> Interface totalmente reformulada com visual "Premium Dark" (estilo Fintech), cabeçalhos imersivos dinâmicos e painéis "Glassmorphism".</li>
                    <li><strong className="text-slate-700">Módulo de Missões Avançado:</strong> Integração de quadros Kanban interativos para gerir tarefas missionárias e novo sistema de disparo de WhatsApp em massa com a IA e suporte a contatos externos.</li>
                    <li><strong className="text-slate-700">Aprimoramento da EBD:</strong> Possibilidade de efetuar upload manual da capa das revistas (evitando bloqueios de servidores externos) e abertura do painel de estudos interativo para membros não matriculados.</li>
                </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-indigo-400">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500"></div>
                <h3 className="font-bold text-lg text-indigo-700">v4.8.1 - Gestão Matriz/Filial & Segurança de Acessos</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Abril 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Arquitetura Matriz e Filiais:</strong> Transição do sistema para suportar nativamente múltiplas congregações (Sede e Filiais) de forma centralizada e organizada dentro do mesmo painel.</li>
                    <li><strong className="text-slate-700">Segurança Restrita (Tenant-Branch):</strong> Implementada a funcionalidade para restringir utilizadores administrativos a uma única filial no cadastro de acessos. O sistema blindará a visão de dados sensíveis de outras congregações.</li>
                    <li><strong className="text-slate-700">Ocultação e Gravação Inteligente:</strong> Ao iniciar sessão com um utilizador restrito, os campos de escolha de filiais desaparecem, e todos os registos novos (Membros, Finanças, Células, etc.) são automaticamente gravados e retidos na base da sua congregação.</li>
                    <li><strong className="text-slate-700">Filtros Globais e Consolidados:</strong> Dashboards, listagens (Tabelas) e Relatórios em PDF (DRE, Fluxo de Caixa, Missões, Rol de Membros) contam agora com seletores dinâmicos, permitindo que a Liderança Geral filtre os resultados por filial ou tenha a visão financeira global unificada.</li>
                </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-emerald-400">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500"></div>
                <h3 className="font-bold text-lg text-emerald-700">v4.8.0 - UX Premium, Painel Master Dev & Efeitos Sonoros</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Abril 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Organização de Menu Inteligente:</strong> O menu lateral foi reestruturado com grupos visuais elegantes.</li>
                    <li><strong className="text-slate-700">Experiência Sensorial (UI Click):</strong> Adicionado um feedback sonoro sutil ao interagir com as opções do menu.</li>
                    <li><strong className="text-slate-700">Painel Master do Desenvolvedor:</strong> Área restrita e exclusiva criada para a parametrização global do SaaS.</li>
                </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-blue-300">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <h3 className="font-bold text-lg text-blue-700">v4.3.0 - PWA Nativo, Notificações & UX</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Fevereiro 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">App Instalável (PWA):</strong> Botões nativos na interface para instalar o sistema como aplicação independente no PC e Telemóvel, operando sem as abas do navegador.</li>
                    <li><strong className="text-slate-700">Central de Notificações:</strong> Alertas inteligentes e automáticos no topo do ecrã sobre despesas a vencer, aniversariantes do dia e tarefas iminentes.</li>
                    <li><strong className="text-slate-700">Ecrã Inteiro (Fullscreen):</strong> Novo botão flutuante para expandir o sistema, ideal para apresentações e maior foco na gestão.</li>
                </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-emerald-300">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500"></div>
                <h3 className="font-bold text-lg text-emerald-700">v4.2.0 - Portal do Membro & CRM de Visitantes</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Fevereiro 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Autoatendimento Mobile:</strong> Acesso rápido a Dízimos, Aulas EBD e Escalas através do smartphone do membro com login via data de nascimento.</li>
                    <li><strong className="text-slate-700">Credencial Digital Interativa:</strong> Cartão oficial do membro com foto, cargos, datas e QR Code gerado em tempo real.</li>
                    <li><strong className="text-slate-700">Funil de Visitantes (CRM):</strong> Acompanhamento em Kanban (Arrastar e Soltar) desde a 1ª visita até à integração total, com atalho para WhatsApp.</li>
                </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-indigo-200">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-400"></div>
                <h3 className="font-bold text-lg text-indigo-700">v4.1.0 - Inteligência Artificial & Estúdio</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Janeiro 2026</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Assistente Pastoral IA:</strong> Geração de esboços de sermão, planos de aula EBD e mensagens melhoradas integrado com Inteligência Artificial (Google Gemini).</li>
                    <li><strong className="text-slate-700">Estúdio Criativo:</strong> Criação de artes para redes sociais diretamente no sistema com templates customizáveis e exportação em PNG.</li>
                    <li><strong className="text-slate-700">Consultoria IA Financeira:</strong> Análise automática da saúde financeira do mês na aba principal da Tesouraria.</li>
                </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-purple-200">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-400"></div>
                <h3 className="font-bold text-lg text-purple-700">v4.0.0 - Secretaria, Relatórios & Segurança</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Dezembro 2025</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700">Central de Relatórios (PDF):</strong> 12 relatórios oficiais (Ata de Reunião, Balanço para Contador, Listagens, Convites) formatados para impressão em alta resolução.</li>
                    <li><strong className="text-slate-700">Auditoria de Logs & Lixeira:</strong> Registo de atividades de quem modificou os dados e módulo de lixeira para recuperar dados apagados acidentalmente.</li>
                    <li><strong className="text-slate-700">Motor de Certificados:</strong> Geração de certificados elegantes (Batismo, Casamento, Apresentação e Consagração).</li>
                    <li><strong className="text-slate-700">Ferramenta de Backup:</strong> Exportação e importação manual da base de dados (JSON) para segurança local em 1 clique.</li>
                </ul>
            </div>
        </div>
    </div>
);

// NOVO: Cache global para otimizar e evitar transferências repetidas das logos dos bancos (moved to ModuleIgreja.tsx)



export default ModuleChangelog;
