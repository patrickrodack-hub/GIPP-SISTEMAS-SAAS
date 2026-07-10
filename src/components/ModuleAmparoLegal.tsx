import React, { useState, useContext, useRef } from 'react';
import { ChurchContext } from '../App';
import { 
  Scale, ShieldCheck, Printer, Download, Search, BookOpen, Quote, 
  FileText, Award, Landmark, HelpCircle, Flame, ExternalLink, ShieldAlert
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ModuleAmparoLegal() {
    const { 
        db, 
        addToast,
        printMarginType,
        printOrientation,
        printContentScale,
        printPalette
    } = useContext(ChurchContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSection, setActiveSection] = useState<'certidao' | 'artigos' | 'jurisprudencia'>('certidao');
    const documentRef = useRef<HTMLDivElement>(null);

    const igrejaData = db.igreja || {
        nome: "Assembleia de Deus Sede",
        cnpj: "00.000.000/0000-00",
        endereco: "Avenida Principal, 100",
        cidade: "São Paulo",
        uf: "SP",
        pastor: "Pr. Presidente da Convenção",
        canon_registro_geral: "RE-AD-1911",
        saas_nome_sistema: "GIPP"
    };

    const legalArticles = [
        {
            title: "Artigo 5º, Inciso VI - Inviolabilidade de Crença e Culto",
            source: "Constituição Federal de 1988",
            content: "É inviolável a liberdade de consciência e de crença, sendo assegurado o livre exercício dos cultos religiosos e garantida, na forma da lei, a proteção aos locais de culto e a suas liturgias.",
            highlight: "Garante que nenhuma autoridade civil, militar ou administrativa pode interromper, multar, embaraçar ou fiscalizar a doutrina ou o culto realizado no templo.",
            tags: ["Constituicão", "Liberdade", "Culto", "Liturgia"]
        },
        {
            title: "Artigo 5º, Inciso VIII - Objeção de Consciência",
            source: "Constituição Federal de 1988",
            content: "Ninguém será privado de direitos por motivo de crença religiosa ou de convicção filosófica ou política, salvo se as invocar para eximir-se de obrigação legal a todos imposta e recusar-se a cumprir prestação alternativa, fixada em lei.",
            highlight: "Garante aos membros e ministros o direito de escusa de consciência, protegendo-os de penalidades legais por professarem sua crença ortodoxa.",
            tags: ["Escusa", "Direitos", "Consciência"]
        },
        {
            title: "Artigo 5º, Inciso XVI - Liberdade de Reunião e Culto Público",
            source: "Constituição Federal de 1988",
            content: "Todos podem reunir-se pacificamente, sem armas, em locais abertos ao público, independentemente de autorização, desde que não frustrem outra reunião anteriormente convocada para o mesmo local, sendo apenas exigido prévio aviso à autoridade competente.",
            highlight: "Protege os cultos ao ar livre, cultos em praça pública, batizados no rio ou evangelismos, dispensando qualquer tipo de alvará especial de manifestação.",
            tags: ["Reunião", "Sem Autorização", "Público"]
        },
        {
            title: "Artigo 19º, Inciso I - Laicidade do Estado (Vedação de Embaraços)",
            source: "Constituição Federal de 1988",
            content: "É vedado à União, aos Estados, ao Distrito Federal e aos Municípios: I - estabelecer cultos religiosos ou igrejas, subvencioná-los, embaraçar-lhes o funcionamento ou manter com eles ou seus representantes relações de dependência ou aliança, ressalvada, na forma da lei, a colaboração de interesse público.",
            highlight: "Veda expressamente ao fisco municipal, vigilância ou polícia colocar empecilhos burocráticos infundados com o objetivo de frear o funcionamento da igreja.",
            tags: ["Laicidade", "Funcionamento", "Não Interferência"]
        },
        {
            title: "Artigo 44º, § 1º - Autonomia das Organizações Religiosas",
            source: "Código Civil Brasileiro (Alterado pela Lei 10.825/2003)",
            content: "São livres a criação, a organização, a estruturação interna e o funcionamento das organizações religiosas, sendo vedado ao poder público negar-lhes reconhecimento ou registro dos atos constitutivos e de caráter necessário ao seu funcionamento.",
            highlight: "A maior vitória do direito religioso brasileiro: impede o Estado de interferir no estatuto social, nos cargos pastorais, nas ordens litúrgicas ou na organização administrativa da igreja.",
            tags: ["Organização", "Código Civil", "Autonomia", "Livre Estruturação"]
        },
        {
            title: "Artigo 150º, Inciso VI, Alínea 'b' - Imunidade Tributária de Templos",
            source: "Constituição Federal de 1988",
            content: "Sem prejuízo de outras garantias asseguradas ao contribuinte, é vedado à União, aos Estados, ao Distrito Federal e aos Municípios: VI - instituir impostos sobre: (...) b) templos de qualquer culto.",
            highlight: "Constitui uma imunidade constitucional absoluta que incide sobre o patrimônio, as rendas (dízimos e ofertas), os serviços essenciais e o prédio do templo.",
            tags: ["Imunidade", "Impostos", "Finanças", "Tributário"]
        }
    ];

    const jurisprudences = [
        {
            title: "ADI 3254 / STF - Direito Próprio de Organização",
            content: "O Supremo Tribunal Federal firmou o entendimento de que a autonomia eclesiástica é plena. O Estado não pode questionar critérios internos de seleção de ministros, ordenação pastoral, imposição de medidas disciplinares pastorais ou o credo ensinado nos púlpitos das congregações.",
            recommendation: "Mantenha sempre a Ata de Eleição da Diretoria e o Estatuto Social atualizados e averbados no Cartório de Títulos e Documentos."
        },
        {
            title: "Imunidade Ampla dos Templos de Qualquer Culto",
            content: "O STF consolidou que a imunidade de impostos para templos abrange não apenas o santuário de cultos, mas também imóveis alugados pela igreja para fins de suas atividades ministeriais, estacionamentos próprios, residência pastoral oficial (casa paroquial) e veículos dedicados à obra de evangelização, desde que os recursos gerados sejam integralmente revertidos para o cumprimento das metas religiosas institucionais.",
            recommendation: "Sempre que adquirir bens ou alugar instalações, peticione administrativamente na Prefeitura de sua cidade requerendo o direito constitucional de imunidade."
        }
    ];

    const handlePrint = () => {
        const printContent = documentRef.current;
        if (!printContent) return;

        addToast("Abrindo diálogo de impressão física do termo...", "info");
        
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        
        const docObj = iframe.contentWindow?.document || iframe.contentDocument;
        if (!docObj) return;

        // Map margins
        let marginTop = '30mm', marginLeft = '30mm', marginBottom = '20mm', marginRight = '20mm';
        if (printMarginType === 'moderada') {
            marginTop = '20mm'; marginLeft = '20mm'; marginBottom = '20mm'; marginRight = '20mm';
        } else if (printMarginType === 'estreita') {
            marginTop = '15mm'; marginLeft = '15mm'; marginBottom = '15mm'; marginRight = '15mm';
        }

        const orientationStr = printOrientation || 'portrait';
        const scalePercent = printContentScale || 100;
        
        docObj.write(`
            <html>
                <head>
                    <title>Declaração Constitucional de Amparo Legal</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                    <style>
                        body { 
                            font-family: 'Inter', sans-serif; 
                            background-color: white; 
                            color: #0f172a; 
                            padding: 0; 
                            margin: 0;
                            zoom: ${scalePercent}%;
                        }
                        @media print {
                            body { 
                                -webkit-print-color-adjust: exact; 
                                print-color-adjust: exact; 
                            }
                            @page {
                                size: A4 ${orientationStr} !important;
                                margin-top: ${marginTop} !important;
                                margin-left: ${marginLeft} !important;
                                margin-bottom: ${marginBottom} !important;
                                margin-right: ${marginRight} !important;
                            }
                        }

                        /* Palette-specific-overrides based on system options */
                        ${printPalette === 'verde' ? `
                            .text-indigo-950, .text-indigo-900, .text-indigo-800 { color: #064e3b !important; }
                            .text-indigo-600, .text-indigo-550, .text-indigo-500 { color: #059669 !important; }
                            .bg-indigo-50 { background-color: #ecfdf5 !important; }
                            .bg-indigo-50\\/10, .bg-indigo-50\\/30 { background-color: rgba(236, 253, 245, 0.3) !important; }
                            .border-indigo-150, .border-indigo-500, .border-indigo-100 { border-color: #a7f3d0 !important; }
                            .from-indigo-950 { --tw-gradient-from: #064e3b !important; }
                            .to-slate-900 { --tw-gradient-to: #022c22 !important; }
                        ` : printPalette === 'cinza' ? `
                            .text-indigo-950, .text-indigo-900, .text-indigo-800 { color: #0f172a !important; }
                            .text-indigo-600, .text-indigo-550, .text-indigo-500 { color: #475569 !important; }
                            .bg-indigo-50 { background-color: #f1f5f9 !important; }
                            .bg-indigo-50\\/10, .bg-indigo-50\\/30 { background-color: rgba(241, 245, 249, 0.3) !important; }
                            .border-indigo-150, .border-indigo-500, .border-indigo-100 { border-color: #cbd5e1 !important; }
                            .from-indigo-950 { --tw-gradient-from: #1e293b !important; }
                            .to-slate-900 { --tw-gradient-to: #0f172a !important; }
                        ` : `
                            /* azul/default - retains standard indigo */
                        `}
                    </style>
                </head>
                <body class="flex justify-center">
                    <div style="width: 800px;">
                        ${printContent.innerHTML}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() {
                                window.parent.document.body.removeChild(window.frameElement);
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        docObj.close();
    };

    const handleDownloadPDF = () => {
        const element = documentRef.current;
        if (!element) return;
        
        addToast("Gerando PDF com certificação jurídica...", "info");
        
        html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            pdf.save(`DECLARACAO_CONSTITUCIONAL_AMPARO_LEGAL.pdf`);
            addToast("PDF Oficial baixado com sucesso!", "success");
        }).catch(e => {
            console.error(e);
            addToast("Erro ao processar as imagens da certidão constitucional.", "error");
        });
    };

    const filteredArticles = legalArticles.filter(art => 
        art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        art.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
        art.highlight.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-8 space-y-8 flex flex-col h-full custom-scrollbar overflow-y-auto">
            {/* Header Module */}
            <div className="flex flex-wrap items-center justify-between gap-6 bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] border border-white mx-1 my-1 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-amber-100 text-amber-800 p-4 rounded-3xl border border-amber-200">
                        <Scale size={36} className="animate-pulse" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Constituição Federal & Amparo Eclesiástico</span>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight font-[Outfit] mt-1.5">Liberdade de Expressão e Culto</h1>
                        <p className="text-xs text-slate-500 font-medium">Bases normativas e certidões jurídicas protetivas para as igrejas protestantes no Brasil</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                    >
                        <Printer size={16}/> Imprimir Certificado
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                    >
                        <Download size={16}/> Baixar PDF Oficial
                    </button>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-full border">
                    <button 
                        onClick={() => setActiveSection('certidao')}
                        className={`flex items-center gap-2 font-bold text-xs px-5 py-2.5 rounded-full transition-all ${activeSection === 'certidao' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Award size={14} /> Certidão de Amparo
                    </button>
                    <button 
                        onClick={() => setActiveSection('artigos')}
                        className={`flex items-center gap-2 font-bold text-xs px-5 py-2.5 rounded-full transition-all ${activeSection === 'artigos' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <BookOpen size={14} /> Artigos & Leis Completas
                    </button>
                    <button 
                        onClick={() => setActiveSection('jurisprudencia')}
                        className={`flex items-center gap-2 font-bold text-xs px-5 py-2.5 rounded-full transition-all ${activeSection === 'jurisprudencia' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Landmark size={14} /> Jurisprudência Protetora
                    </button>
                </div>

                {activeSection === 'artigos' && (
                    <div className="relative w-full md:w-80">
                        <input 
                            type="text" 
                            placeholder="Buscar termos protetivos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-250 py-2.5 pl-10 pr-4 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                )}
            </div>

            {/* Main Segment */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Side Info / Guide Panel */}
                <div className="space-y-6 xl:col-span-1">
                    <div className="bg-white/80 border rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 text-indigo-700">
                            <ShieldCheck size={20} />
                            <h3 className="font-extrabold text-sm uppercase tracking-wider">A Blindagem Jurídica</h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                            A Constituição Federal do Brasil institui uma blindagem completa à liberdade de expressão religiosa das igrejas protestantes históricas, pentecostais e neopentecostais.
                        </p>
                        <ul className="text-xs text-slate-500 space-y-2 font-medium">
                            <li className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                <span><strong className="text-slate-700">Livre Doutrina:</strong> Nenhuma esfera governamental pode ditar o teor de sermões baseados em convicção bíblica moral.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                <span><strong className="text-slate-700">Não embaraço:</strong> Prefeituras e governos são proibidos de criar leis estaduais ou municipais restritivas aos credos devidamente qualificados.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                <span><strong className="text-slate-700">Imunidade Total:</strong> Dízimos, ofertas pastorais e propriedades eclesiásticas em serviço são imunes a impostos.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 text-amber-800">
                            <ShieldAlert size={20} className="shrink-0" />
                            <h3 className="font-extrabold text-sm uppercase tracking-wider">Orientação Pastoral Importante</h3>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-bold">
                            Para usufruir da segurança jurídica constitucional no Brasil, a igreja local deve sempre:
                        </p>
                        <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4 font-semibold leading-relaxed">
                            <li>Manter o Estatuto Social devidamente registrado no Cartório de Pessoa Jurídica da Comarca correspondente;</li>
                            <li>Registrar todas as atas de eleição e posse da Diretoria Executiva;</li>
                            <li>Efetuar a escrituração contábil idônea de receitas e despesas por meio do sistema unificado GIPP;</li>
                            <li>Realizar a declaração anual de imunidade e isenções tributárias perante a Receita Federal (ECF) e as esferas municipais.</li>
                        </ol>
                    </div>
                </div>

                {/* Main Content Pane (Certidão, Artigos ou Jurisprudencia) */}
                <div className="xl:col-span-2">
                    {activeSection === 'certidao' && (
                        <div className="bg-slate-100 rounded-[2.5rem] p-4 md:p-8 border border-slate-200 overflow-x-auto flex justify-center custom-scrollbar shadow-inner">
                            <div 
                                ref={documentRef}
                                className="w-[794px] bg-white p-12 md:p-14 border-[14px] border-double border-amber-600 rounded-[2.2rem] shadow-xl text-slate-900 relative flex flex-col justify-between"
                                style={{ fontFamily: "Inter, sans-serif", minHeight: "1020px" }}
                            >
                                {/* Ornate Metal Corner Caps */}
                                <div className="absolute top-4 left-4 w-12 h-12 border-t-8 border-l-8 border-amber-600 rounded-tl-xl opacity-90" />
                                <div className="absolute top-4 right-4 w-12 h-12 border-t-8 border-r-8 border-amber-600 rounded-tr-xl opacity-90" />
                                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-8 border-l-8 border-amber-600 rounded-bl-xl opacity-90" />
                                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-8 border-r-8 border-amber-600 rounded-br-xl opacity-90" />

                                <div className="text-center space-y-5">
                                    {/* República Federativa Cabecalho */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-green-600 via-emerald-600 to-amber-500 rounded-2xl flex items-center justify-center text-white font-black shadow-md border-2 border-amber-400 relative">
                                            <Scale size={28} className="text-white" />
                                        </div>
                                        <h1 className="mt-3.5 font-black uppercase text-slate-950 tracking-[0.25em] text-xs">República Federativa do Brasil</h1>
                                        <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mt-1">Garantia Constitucional de Liberdade de Culto</h2>
                                        <p className="text-[8px] text-amber-700 font-extrabold uppercase tracking-widest mt-1">Instrumento Particular de Prerrogativa de Livre Crença</p>
                                    </div>

                                    <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent my-4" />

                                    <div className="space-y-4">
                                        <h3 className="text-xl md:text-2xl font-black uppercase text-amber-800 tracking-wider font-serif italic text-center">
                                            DECLARAÇÃO DE AMPARO LEGAL & DOUTRINÁRIO
                                        </h3>
                                        
                                        <p className="text-xs text-justify text-slate-700 leading-relaxed max-w-[650px] mx-auto font-medium">
                                            DECLARAMOS, em face de todas as instâncias estatais da República Federativa do Brasil, em cumprimento às garantias constitucionais vigentes, que a organização eclesiástica <strong className="text-slate-950 uppercase font-black">{igrejaData.nome}</strong>, inscrita regularmente no CNPJ sob o número <strong className="text-slate-950 font-mono font-black">{igrejaData.cnpj}</strong>, sediada no endereço <strong className="text-slate-950 uppercase">{igrejaData.endereco}</strong> — cidade de <strong className="text-slate-950 uppercase font-black">{igrejaData.cidade}</strong>, Estado do <strong className="text-slate-950 font-black">{igrejaData.uf}</strong>, goza de plena liberdade, autonomia jurídica, dogmática e eclesiástica doutrinária nos termos expressos na legislação federal brasileira.
                                        </p>
                                    </div>

                                    {/* Transcriptions Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 max-w-[660px] mx-auto text-left">
                                        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-250 shadow-inner">
                                            <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-2 border-b border-amber-200 pb-1 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-amber-500"></span> Constituição Federal de 1988
                                            </h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="block text-[8px] font-black uppercase text-slate-800 tracking-wide">Artigo 5º, Inciso VI (Liberdade de Culto)</span>
                                                    <p className="text-[9px] text-slate-600 italic font-serif leading-relaxed mt-0.5">
                                                        "É inviolável a liberdade de consciência e de crença, sendo assegurado o livre exercício dos cultos religiosos e garantida, na forma da lei, a proteção aos locais de culto e a suas liturgias."
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="block text-[8px] font-black uppercase text-slate-800 tracking-wide">Artigo 19º, Inciso I (Laicidade Absoluta)</span>
                                                    <p className="text-[9px] text-slate-600 italic font-serif leading-relaxed mt-0.5">
                                                        "É vedado à União, aos Estados, ao Distrito Federal e aos Municípios estabelecer cultos religiosos ou igrejas, subvencioná-los, embaraçar-lhes o funcionamento ou manter com eles relações de dependência..."
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-250 shadow-inner">
                                            <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-2 border-b border-emerald-200 pb-1 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Código Civil (Lei 10.825/2003)
                                            </h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="block text-[8px] font-black uppercase text-slate-800 tracking-wide">Artigo 44, Parágrafo 1º</span>
                                                    <p className="text-[9px] text-slate-600 italic font-serif leading-relaxed mt-0.5">
                                                        "São livres a criação, a organização, a estruturação interna e o funcionamento das organizações religiosas, sendo vedado ao poder público negar-lhes reconhecimento ou registro..."
                                                    </p>
                                                </div>
                                                <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                                                    <span className="block text-[8px] font-bold text-emerald-800 uppercase tracking-wide">Impedimento do Estado</span>
                                                    <p className="text-[8.5px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                                                        A autoridade civil não pode intervir, policiar ou regular as crenças, batismos, exclusões de membros, nomeações administrativas ou as doutrinas propagadas.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signatures */}
                                    <div className="pt-10 max-w-[600px] mx-auto">
                                        <div className="flex flex-wrap items-center justify-between gap-10">
                                            <div className="flex-1 text-center min-w-[180px]">
                                                <div className="w-full h-px bg-slate-300 mb-1 max-w-[200px] mx-auto" />
                                                <span className="block text-xs uppercase font-black text-slate-800">{igrejaData.pastor}</span>
                                                <span className="block text-[7px] text-slate-400 font-black uppercase tracking-widest">Líder Religioso de Púlpito Sede</span>
                                            </div>
                                            <div className="flex-1 text-center min-w-[180px]">
                                                <div className="w-full h-px bg-slate-300 mb-1 max-w-[200px] mx-auto" />
                                                <span className="block text-xs uppercase font-black text-slate-800">{igrejaData.canon_registro_geral || 'RE-AD-1911'}</span>
                                                <span className="block text-[7px] text-slate-400 font-black uppercase tracking-widest">Inscrição Eclesiástica Consocial</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Authenticity */}
                                    <div className="pt-8 flex flex-col items-center gap-1.5">
                                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[7px] font-black tracking-widest uppercase">
                                            <ShieldCheck size={9} className="text-indigo-600" /> autenticado via sistema gipp v8.9.0
                                        </div>
                                        <span className="text-[6.5px] text-slate-400 font-semibold">Este documento oficial comprova as prerrogativas de fé e impede embargos infundados.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'artigos' && (
                        <div className="space-y-4 animate-entrance">
                            {filteredArticles.length === 0 ? (
                                <div className="text-center bg-white border rounded-2xl p-12">
                                    <HelpCircle size={40} className="mx-auto text-slate-400 mb-2" />
                                    <p className="text-sm font-bold text-slate-700">Nenhum termo legal protetor encontrado para "{searchTerm}"</p>
                                    <p className="text-xs text-slate-500 mt-1">Tente buscar por palavras como "Imunidade", "Culto" ou "Organização".</p>
                                </div>
                            ) : (
                                filteredArticles.map((art, idx) => (
                                    <div key={idx} className="bg-white border rounded-3xl p-6 shadow-xs hover:border-indigo-400 transition-all space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                                                    {art.source}
                                                </span>
                                                <h3 className="text-base font-black text-slate-800 tracking-tight font-[Outfit] mt-2">{art.title}</h3>
                                            </div>
                                            <Quote size={20} className="text-slate-200 shrink-0" />
                                        </div>

                                        <p className="text-xs leading-relaxed italic text-slate-600 border-l-2 border-amber-500 pl-4 py-1 font-serif bg-slate-50/50 pr-4">
                                            "{art.content}"
                                        </p>

                                        <div className="pt-2 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
                                            <p className="text-xs text-indigo-950 font-semibold">
                                                <span className="font-extrabold uppercase tracking-wide text-indigo-650 text-[10px] block mb-1">Como Isso Protege Sua Igreja:</span>
                                                {art.highlight}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {art.tags.map((tag, tIdx) => (
                                                <span key={tIdx} className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full tracking-wider">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeSection === 'jurisprudencia' && (
                        <div className="space-y-4 animate-entrance">
                            {jurisprudences.map((jur, idx) => (
                                <div key={idx} className="bg-white border rounded-3xl p-6 shadow-xs space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-250 flex items-center justify-center text-emerald-800">
                                            <Landmark size={14} />
                                        </div>
                                        <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">{jur.title}</h3>
                                    </div>
                                    
                                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                        {jur.content}
                                    </p>

                                    <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-2xl flex items-start gap-3">
                                        <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="block text-[9px] font-black text-emerald-800 uppercase tracking-wider">Recomendação do GIPP:</span>
                                            <p className="text-[11px] text-slate-600 leading-relaxed font-bold mt-1">
                                                {jur.recommendation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
