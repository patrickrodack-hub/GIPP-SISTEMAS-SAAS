import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rocket,
  DollarSign,
  CheckCircle2,
  Share2,
  Download,
  Copy,
  Printer,
  Sparkles,
  Building,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Phone,
  Mail,
  FileText,
  Calculator,
  Crown,
  Check,
  Layers,
  Globe,
  ArrowRight,
  Plus,
  BarChart2,
  Play
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface LeadIgreja {
  id: string;
  nomeIgreja: string;
  responsavelNome: string;
  cargo: string;
  cidadeUF: string;
  membrosEstimados: number;
  telefone: string;
  faseFunil: 'Novo Lead' | 'Demonstração Agendada' | 'Proposta Enviada' | 'Em Teste (Trial)' | 'Contrato Fechado';
  valorProposta: number;
}

export default function ModuleVendasEDivulgacao() {
  const context = useContext(ChurchContext) as any;
  const { addToast } = context || {};

  const [activeTab, setActiveTab] = useState<'pitch' | 'planos' | 'crm' | 'marketing'>('pitch');
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  // Calculadora de Planos
  const [qtdMembros, setQtdMembros] = useState<number>(250);
  const [qtdCongregacoes, setQtdCongregacoes] = useState<number>(1);
  const [faturamentoCiclo, setFaturamentoCiclo] = useState<'mensal' | 'anual'>('anual');
  const [includeWhatsapp, setIncludeWhatsapp] = useState<boolean>(true);
  const [includeAI, setIncludeAI] = useState<boolean>(true);

  // Proposal modal
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [propIgreja, setPropIgreja] = useState('');
  const [propPastor, setPropPastor] = useState('');

  // Leads CRM
  const [leads, setLeads] = useState<LeadIgreja[]>([
    {
      id: 'lead_1',
      nomeIgreja: 'Assembleia de Deus Templo Central',
      responsavelNome: 'Pr. Marcos Souza',
      cargo: 'Pastor Presidente',
      cidadeUF: 'Campinas - SP',
      membrosEstimados: 650,
      telefone: '(19) 99887-6655',
      faseFunil: 'Proposta Enviada',
      valorProposta: 299.00
    },
    {
      id: 'lead_2',
      nomeIgreja: 'Igreja Evangélica Monte das Oliveiras',
      responsavelNome: 'Pb. André Luiz',
      cargo: 'Secretário Geral',
      cidadeUF: 'Niterói - RJ',
      membrosEstimados: 180,
      telefone: '(21) 98765-4321',
      faseFunil: 'Em Teste (Trial)',
      valorProposta: 149.00
    },
    {
      id: 'lead_3',
      nomeIgreja: 'AD Campo de São José',
      responsavelNome: 'Ev. Fernando Dias',
      cargo: 'Tesoureiro de Campo',
      cidadeUF: 'São José dos Campos - SP',
      membrosEstimados: 1200,
      telefone: '(12) 99123-4567',
      faseFunil: 'Demonstração Agendada',
      valorProposta: 499.00
    }
  ]);

  const [novoLeadNome, setNovoLeadNome] = useState('');
  const [novoLeadResp, setNovoLeadResp] = useState('');
  const [novoLeadTel, setNovoLeadTel] = useState('');
  const [novoLeadMembros, setNovoLeadMembros] = useState('');
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // Cálculo de Preço do Plano
  const calcularPrecoPlano = () => {
    let base = 99.00; // Básico
    if (qtdMembros > 150 || qtdCongregacoes > 1) base = 199.00; // Standard
    if (qtdMembros > 500 || qtdCongregacoes > 3) base = 349.00; // Avançado / Enterprise

    if (includeWhatsapp) base += 49.00;
    if (includeAI) base += 39.00;

    if (faturamentoCiclo === 'anual') {
      base = base * 0.8; // 20% de desconto no plano anual
    }

    return base;
  };

  const precoFinal = calcularPrecoPlano();

  const handleCopyScript = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedScript(key);
    addToast('Script de vendas copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const handleAdicionarLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoLeadNome || !novoLeadResp) return;

    const item: LeadIgreja = {
      id: `lead_${Date.now()}`,
      nomeIgreja: novoLeadNome,
      responsavelNome: novoLeadResp,
      cargo: 'Líder / Pr. Presidente',
      cidadeUF: 'Brasil',
      membrosEstimados: parseInt(novoLeadMembros) || 100,
      telefone: novoLeadTel || '(00) 00000-0000',
      faseFunil: 'Novo Lead',
      valorProposta: precoFinal
    };

    setLeads([item, ...leads]);
    setIsLeadModalOpen(false);
    setNovoLeadNome('');
    setNovoLeadResp('');
    setNovoLeadTel('');
    setNovoLeadMembros('');
    addToast(`Oportunidade comercial para "${item.nomeIgreja}" cadastrada no CRM!`, 'success');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner Commercial */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <Rocket size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SaaS Commercial & Expansion Engine
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Central de Vendas, Propostas & Divulgação do GIPP
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Apresente o sistema para Pastores Presidentes e Diretoria, calcule planos, gere propostas comerciais oficiais em PDF e gerencie o funil de prospecção de igrejas.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl relative z-10">
          <button
            onClick={() => setActiveTab('pitch')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pitch' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} /> Pitch & Vantagens
          </button>
          <button
            onClick={() => setActiveTab('planos')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'planos' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator size={14} /> Calculadora de Planos
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'crm' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp size={14} /> Pipeline CRM de Vendas
          </button>
          <button
            onClick={() => setActiveTab('marketing')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'marketing' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 size={14} /> Scripts & Kit Marketing
          </button>
        </div>
      </div>

      {/* TAB 1: PITCH DE VENDAS & APRESENTAÇÃO EXECUTIVA */}
      {activeTab === 'pitch' && (
        <div className="space-y-6">
          {/* Hero Pitch Box */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 inline-block">
              A Plataforma #1 de Gestão Eclesiástica Pentecostal
            </span>

            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Transforme a Gestão da sua Igreja com Inteligência, Compliance e Doutrina Integrada
            </h2>

            <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed font-medium">
              O <strong className="text-emerald-400 font-black">GIPP (Gestão Integrada Para Pastores)</strong> combina a profundidade teológica das Assembleias de Deus (CGADB/CPAD) com o mais avançado compliance financeiro (RDT/eSocial, Dupla Custódia e Centros de Custo).
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setActiveTab('planos')}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calculator size={16} /> Simular Plano da Minha Igreja
              </button>

              <button
                onClick={() => {
                  addToast('Copiado link de demonstração em tempo real para enviar ao Pastor!', 'success');
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-2xl border border-slate-700 shadow-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Share2 size={16} className="text-emerald-400" /> Compartilhar Demo ao Vivo
              </button>
            </div>
          </div>

          {/* 4 Pilares Comerciais / Differentiators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl w-fit border border-emerald-500/30">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base font-black text-white">Compliance CFO & eSocial</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Emissão de RDTs pastorais sem vínculo CLT conforme o Art. 3º §2º, Dupla Custódia anti-fraude para dízimos e apuração para EFD-Reinf.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition-all space-y-3">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl w-fit border border-blue-500/30">
                <Users size={24} />
              </div>
              <h3 className="text-base font-black text-white">Salinha Kids & QR Code</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Segurança total no ministério infantil com emissão de etiquetas térmicas e check-in/out seguro via leitores de QR Code.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl w-fit border border-purple-500/30">
                <Sparkles size={24} />
              </div>
              <h3 className="text-base font-black text-white">Copilot AI Pastoral</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inteligência Artificial alimentada estritamente com os 24 capítulos da Declaração de Fé da CGADB/CPAD para auxílio em esboços.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl w-fit border border-amber-500/30">
                <Globe size={24} />
              </div>
              <h3 className="text-base font-black text-white">PWA Offline-First</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sincronização ininterrupta mesmo sem internet em salas de aula ou acampamentos, armazenando dados no dispositivo do usuário.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CALCULADORA DE PLANOS & GERADOR DE PROPOSTA */}
      {activeTab === 'planos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Simulador */}
            <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Calculator className="text-emerald-400" size={20} /> Simulador Comercial Interativo
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Número de Membros Estimado</label>
                  <input
                    type="number"
                    value={qtdMembros}
                    onChange={e => setQtdMembros(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Ex: 250 membros cadastrados na sede</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Número de Congregações / Filiais</label>
                  <input
                    type="number"
                    value={qtdCongregacoes}
                    onChange={e => setQtdCongregacoes(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Ex: 1 Templo Sede + 2 Congregações</span>
                </div>
              </div>

              {/* Ciclo de Pagamento */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase block">Ciclo de Faturamento</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
                  <button
                    onClick={() => setFaturamentoCiclo('mensal')}
                    className={`py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      faturamentoCiclo === 'mensal' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => setFaturamentoCiclo('anual')}
                    className={`py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      faturamentoCiclo === 'anual' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Anual <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">20% OFF</span>
                  </button>
                </div>
              </div>

              {/* Módulos Adicionais */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 uppercase block">Adicionais Opcionais</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeWhatsapp}
                      onChange={e => setIncludeWhatsapp(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Automação de WhatsApp (Baileys API) (+R$ 49/mês)</span>
                      <span className="text-[10px] text-slate-400">Disparo automático de aniversariantes, avisos e escalas de culto.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAI}
                      onChange={e => setIncludeAI(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Módulo Copilot AI Pastoral (+R$ 39/mês)</span>
                      <span className="text-[10px] text-slate-400">Geração de esboços exegéticos e ilustrações sermônicas ilimitadas.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Totalizador do Plano e Botão Proposta */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Plano Recomendado
                </span>

                <div>
                  <span className="text-xs text-slate-400 font-bold block uppercase">Investimento Mensal</span>
                  <div className="text-4xl font-black text-emerald-400 tracking-tight mt-1">
                    R$ {precoFinal.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ mês</span>
                  </div>
                  {faturamentoCiclo === 'anual' && (
                    <span className="text-[10px] text-emerald-300 font-bold block mt-1">
                      ✓ Cobrado anualmente (R$ {(precoFinal * 12).toFixed(2)}/ano)
                    </span>
                  )}
                </div>

                <ul className="text-xs space-y-2 text-slate-300 pt-3 border-t border-slate-800">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Até {qtdMembros} membros cadastrados</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> {qtdCongregacoes} congregação(ões) conectada(s)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> CFO Executivo (RDT / eSocial / Dupla Custódia)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Suporte prioritário via WhatsApp</li>
                </ul>
              </div>

              <button
                onClick={() => setIsProposalModalOpen(true)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={16} /> Gerar Proposta Comercial PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PIPELINE CRM DE VENDAS */}
      {activeTab === 'crm' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={20} /> Funil Prospecção de Igrejas (CRM)
            </h2>

            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> Nova Igreja Lead
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leads.map(l => (
              <div key={l.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {l.faseFunil}
                  </span>
                  <strong className="text-emerald-400 text-sm font-black">R$ {l.valorProposta.toFixed(2)}/mês</strong>
                </div>

                <div>
                  <h3 className="text-base font-black text-white">{l.nomeIgreja}</h3>
                  <p className="text-xs text-slate-400">{l.responsavelNome} ({l.cargo})</p>
                  <p className="text-xs text-slate-500 mt-1">{l.cidadeUF} • {l.membrosEstimados} membros est.</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Tel: {l.telefone}</span>
                  <button
                    onClick={() => addToast(`Iniciando contato via WhatsApp com ${l.responsavelNome}...`, 'info')}
                    className="p-1.5 bg-emerald-600/20 text-emerald-400 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    <Phone size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SCRIPTS & KIT MARKETING */}
      {activeTab === 'marketing' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Share2 className="text-emerald-400" size={20} /> Copywriting & Scripts de Abordagem Comercial
            </h2>

            <div className="space-y-4">
              {/* Script 1 */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400 uppercase">Script 1: Abordagem para Pastor Presidente</span>
                  <button
                    onClick={() => handleCopyScript(
                      'Paz do Senhor, Pr. Presidente! Apresento o GIPP: a plataforma completa de gestão eclesiástica para a Assembleia de Deus com emissão de RDTs pastorais, Dupla Custódia de dízimos e Salinha Kids com QR Code. Podemos agendar 10 minutos para uma demonstração?',
                      's1'
                    )}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl flex items-center gap-1"
                  >
                    {copiedScript === 's1' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedScript === 's1' ? 'Copiado!' : 'Copiar Script'}
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                  "Paz do Senhor, Pr. Presidente! Apresento o GIPP: a plataforma completa de gestão eclesiástica para a Assembleia de Deus com emissão de RDTs pastorais, Dupla Custódia de dízimos e Salinha Kids com QR Code. Podemos agendar 10 minutos para uma demonstração?"
                </p>
              </div>

              {/* Script 2 */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-400 uppercase">Script 2: Abordagem para Tesoureiro / Secretário</span>
                  <button
                    onClick={() => handleCopyScript(
                      'A paz do Senhor, irmão! Conheça o GIPP: sistema que automatiza a emissão de cartas de recomendação, livros de ata e relatórios financeiros com DRE e DFD. Quer testar gratuitamente por 14 dias?',
                      's2'
                    )}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl flex items-center gap-1"
                  >
                    {copiedScript === 's2' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedScript === 's2' ? 'Copiado!' : 'Copiar Script'}
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                  "A paz do Senhor, irmão! Conheça o GIPP: sistema que automatiza a emissão de cartas de recomendação, livros de ata e relatórios financeiros com DRE e DFD. Quer testar gratuitamente por 14 dias?"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Imprimir Proposta Comercial Oficial */}
      <AnimatePresence>
        {isProposalModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-lg rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-emerald-400">Proposta Comercial Oficial GIPP SaaS</span>
                <button onClick={() => setIsProposalModalOpen(false)} className="p-1 text-slate-400">✕</button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nome da Igreja Cliente *</label>
                  <input
                    type="text"
                    value={propIgreja}
                    onChange={e => setPropIgreja(e.target.value)}
                    placeholder="Ex: AD Templo Central"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nome do Pastor / Responsável</label>
                  <input
                    type="text"
                    value={propPastor}
                    onChange={e => setPropPastor(e.target.value)}
                    placeholder="Ex: Pr. Marcos Souza"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Folha de Proposta Timbrada */}
              <div className="p-6 bg-white text-slate-900 rounded-2xl shadow-xl space-y-3 font-serif text-xs leading-relaxed">
                <div className="text-center font-sans border-b border-slate-300 pb-2">
                  <h3 className="text-sm font-black text-slate-900">PROPOSTA COMERCIAL DE LICENCIAMENTO SAAS</h3>
                  <p className="text-[10px] text-slate-500">GIPP • Gestão Integrada Para Pastores & Igrejas</p>
                </div>

                <p>
                  Apresentamos ao(à) <strong>{propIgreja || 'Igreja Evangélica'}</strong>, aos cuidados do(a) estimado(a) <strong>{propPastor || 'Diretoria Executiva'}</strong>, a proposta de licenciamento da plataforma GIPP.
                </p>

                <div className="bg-slate-100 p-3 rounded-xl font-sans text-[11px] space-y-1">
                  <div className="flex justify-between"><span>Plano Selecionado:</span><strong className="text-emerald-700">Licença Executiva GIPP</strong></div>
                  <div className="flex justify-between"><span>Capacidade de Membros:</span><span>Até {qtdMembros} Membros</span></div>
                  <div className="flex justify-between"><span>Congregações Conectadas:</span><span>{qtdCongregacoes} Unidade(s)</span></div>
                  <div className="flex justify-between border-t border-slate-300 pt-1 font-bold text-slate-900 text-sm">
                    <span>INVESTIMENTO MENSAL:</span>
                    <strong>R$ {precoFinal.toFixed(2)} / mês</strong>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 font-sans italic">
                  Incluso: Suporte técnico via WhatsApp, backups automatizados na nuvem, atualizações de novos módulos e treinamento para secretários e tesoureiros.
                </p>
              </div>

              <button
                onClick={() => {
                  window.print();
                  addToast('Imprimindo Proposta Comercial Oficial!', 'info');
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={16} /> Imprimir Proposta Comercial
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Novo Lead */}
      <AnimatePresence>
        {isLeadModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-black text-white">Cadastrar Oportunidade de Venda (CRM)</h3>
                <button onClick={() => setIsLeadModalOpen(false)} className="p-1 text-slate-400">✕</button>
              </div>

              <form onSubmit={handleAdicionarLead} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nome da Igreja *</label>
                  <input
                    type="text"
                    required
                    value={novoLeadNome}
                    onChange={e => setNovoLeadNome(e.target.value)}
                    placeholder="Ex: AD Campo de Piracicaba"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nome do Responsável / Pastor *</label>
                  <input
                    type="text"
                    required
                    value={novoLeadResp}
                    onChange={e => setNovoLeadResp(e.target.value)}
                    placeholder="Ex: Pr. Daniel Oliveira"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={novoLeadTel}
                    onChange={e => setNovoLeadTel(e.target.value)}
                    placeholder="Ex: (11) 98877-6655"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Membros Estimados</label>
                  <input
                    type="number"
                    value={novoLeadMembros}
                    onChange={e => setNovoLeadMembros(e.target.value)}
                    placeholder="Ex: 350"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsLeadModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg">Salvar Oportunidade</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
